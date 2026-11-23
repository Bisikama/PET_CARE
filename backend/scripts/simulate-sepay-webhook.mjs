/**
 * Script giả lập SePay gửi webhook "tiền vào" tới backend — để test luồng chuyển khoản mà KHÔNG cần tiền thật.
 *
 * Cách dùng (chạy trong thư mục backend):
 *   node --env-file=.env scripts/simulate-sepay-webhook.mjs <NOI_DUNG_CK> <SO_TIEN> [--id=<id>] [--url=<webhook url>]
 *
 * Ví dụ:
 *   node --env-file=.env scripts/simulate-sepay-webhook.mjs PCX7K2M9QA4B 100000
 *   node --env-file=.env scripts/simulate-sepay-webhook.mjs "chuyen tien an trua" 50000      # => UNMATCHED
 *   node --env-file=.env scripts/simulate-sepay-webhook.mjs PCX7K2M9QA4B 100000 --id=12345  # gửi lại cùng id => DUPLICATE
 *
 * Cần trong .env: SEPAY_WEBHOOK_API_KEY, BANK_ACCOUNT_NUMBER (và PORT nếu không phải 3000).
 * ⚠ Backend ghi thật vào database mà nó đang kết nối.
 */

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, ...v] = a.slice(2).split('=');
      return [k, v.join('=')];
    }),
);
const [content, amountArg] = args.filter((a) => !a.startsWith('--'));

if (!content || !amountArg) {
  console.error(
    'Thiếu tham số. Dùng: node --env-file=.env scripts/simulate-sepay-webhook.mjs <NOI_DUNG_CK> <SO_TIEN> [--id=] [--url=]',
  );
  process.exit(1);
}

const apiKey = process.env.SEPAY_WEBHOOK_API_KEY;
const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
if (!apiKey || !accountNumber) {
  console.error('Thiếu SEPAY_WEBHOOK_API_KEY hoặc BANK_ACCOUNT_NUMBER trong .env');
  process.exit(1);
}

const amount = Number(amountArg);
if (!Number.isInteger(amount) || amount <= 0) {
  console.error('SO_TIEN phải là số nguyên dương (VND), ví dụ 100000');
  process.exit(1);
}

const url = flags.url || `http://localhost:${process.env.PORT || 3000}/api/payments/sepay-webhook`;
// id phải khác nhau giữa các giao dịch; mặc định dùng timestamp
const id = flags.id ? Number(flags.id) : Date.now();
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const transactionDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

const payload = {
  id,
  gateway: 'MBBank',
  transactionDate,
  accountNumber,
  subAccount: '',
  code: null,
  content,
  transferType: 'in',
  description: `SIMULATED ${content}`,
  transferAmount: amount,
  accumulated: 0,
  referenceCode: `SIM${id}`,
};

console.log(`→ POST ${url}`);
console.log(`  id=${id} amount=${amount} content="${content}"`);

let res;
try {
  res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Apikey ${apiKey}` },
    body: JSON.stringify(payload),
  });
} catch (err) {
  console.error(
    `✖ Không gọi được ${url} — backend đã chạy chưa? (${err.cause?.message || err.message})`,
  );
  process.exit(1);
}
const text = await res.text();
console.log(`← HTTP ${res.status} ${text}`);
process.exit(res.ok ? 0 : 1);
