import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Tiện ích dùng chung cho thanh toán chuyển khoản VietQR (booking và gói hội viên).
 * Không phụ thuộc module Nest nào để GrowthModule và PaymentsModule đều import được
 * mà không tạo vòng phụ thuộc.
 */

// Bỏ các ký tự dễ nhầm (0/O, 1/I/L) để khách gõ tay nội dung CK không bị sai
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_RANDOM_LENGTH = 10;

/** Ngân hàng thường cắt nội dung CK dài; VietQR khuyến nghị tối đa ~50 ký tự. */
export const TRANSFER_CONTENT_MAX_LENGTH = 50;

export interface BankTransferConfig {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  qrBaseUrl: string;
  codePrefix: string;
}

export interface BankTransferInstructions {
  paymentCode: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrImageUrl: string;
}

export function getBankTransferConfig(configService: ConfigService): BankTransferConfig {
  const codePrefix = (configService.get<string>('PAYMENT_CODE_PREFIX') || 'PC').toUpperCase();
  if (!/^[A-Z]{2,5}$/.test(codePrefix)) {
    throw new InternalServerErrorException('PAYMENT_CODE_PREFIX phải gồm 2-5 chữ cái');
  }
  return {
    accountNumber: configService.getOrThrow<string>('BANK_ACCOUNT_NUMBER'),
    accountName: configService.getOrThrow<string>('BANK_ACCOUNT_NAME'),
    bankCode: configService.get<string>('BANK_CODE') || 'MBBank',
    bankName: configService.get<string>('BANK_DISPLAY_NAME') || 'MB Bank (Ngân hàng Quân Đội)',
    // endpoint ảnh QR theo tài liệu SePay
    qrBaseUrl: configService.get<string>('SEPAY_QR_BASE_URL') || 'https://vietqr.app/img',
    codePrefix,
  };
}

export function randomPaymentCode(prefix: string): string {
  const bytes = crypto.randomBytes(CODE_RANDOM_LENGTH);
  let suffix = '';
  for (const byte of bytes) suffix += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return `${prefix}${suffix}`;
}

/**
 * Sinh mã thanh toán chưa bị dùng. `isTaken` phải kiểm tra MỌI bảng có mã thanh toán
 * (payments.transaction_code và subscription_orders.payment_code) vì webhook dò chung một dải mã.
 */
export async function generateUniquePaymentCode(
  prefix: string,
  isTaken: (code: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomPaymentCode(prefix);
    if (!(await isTaken(code))) return code;
  }
  throw new InternalServerErrorException('Không tạo được mã thanh toán, vui lòng thử lại');
}

/** Bỏ dấu tiếng Việt và ký tự đặc biệt — nhiều ngân hàng không nhận dấu trong nội dung CK. */
export function toTransferText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Nội dung CK: mã thanh toán đứng ĐẦU (webhook dò theo mã), phần mô tả phía sau để khách
 * và admin đọc sao kê biết khoản tiền trả cho gì. Phần mô tả bị cắt nếu quá dài.
 */
export function buildTransferContent(paymentCode: string, description: string): string {
  const desc = toTransferText(description);
  if (!desc) return paymentCode;
  const room = TRANSFER_CONTENT_MAX_LENGTH - paymentCode.length - 1;
  if (room <= 0) return paymentCode;
  return `${paymentCode} ${desc.slice(0, room).trim()}`;
}

export function buildBankTransferInstructions(
  bank: BankTransferConfig,
  paymentCode: string,
  amount: number,
  transferContent: string,
): BankTransferInstructions {
  const qrParams = new URLSearchParams({
    acc: bank.accountNumber,
    bank: bank.bankCode,
    amount: String(amount),
    des: transferContent,
  });
  return {
    paymentCode,
    amount,
    bankName: bank.bankName,
    bankCode: bank.bankCode,
    accountNumber: bank.accountNumber,
    accountName: bank.accountName,
    transferContent,
    qrImageUrl: `${bank.qrBaseUrl}?${qrParams.toString()}`,
  };
}
