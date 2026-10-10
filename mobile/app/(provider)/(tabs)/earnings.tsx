import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Building2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  X,
  CreditCard,
} from 'lucide-react-native';
import { Screen } from '@/core/components/Screen';
import { theme } from '@/core/theme';
import { formatCurrency } from '@/core/utils/currency';
import {
  walletApi,
  WalletBalanceResponse,
  WalletTransactionItem,
  ProviderBankAccount,
  PayoutRequestItem,
} from '@/infrastructure/api/wallet.api';

type TabFilter = 'ALL' | 'INCOME' | 'PAYOUT' | 'REQUESTS';

export default function ProviderEarningsRoute() {
  const [wallet, setWallet] = useState<WalletBalanceResponse>({ balance: 0, pendingBalance: 0 });
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [bankAccounts, setBankAccounts] = useState<ProviderBankAccount[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');

  // Modal states
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Form states
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // New Bank Form
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [branch, setBranch] = useState('');
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);

  // Topup amount for testing
  const [topupAmount, setTopupAmount] = useState('500000');
  const [isSubmittingTopup, setIsSubmittingTopup] = useState(false);

  const fetchData = useCallback(async (isPull = false) => {
    if (isPull) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [walletData, txData, banksData, requestsData] = await Promise.all([
        walletApi.getMyWallet(),
        walletApi.getTransactions(1, 50),
        walletApi.getBankAccounts(),
        walletApi.getPayoutRequests(1, 20),
      ]);

      setWallet(walletData);
      setTransactions(txData.data || []);
      setBankAccounts(banksData || []);
      setPayoutRequests(requestsData || []);

      if (banksData && banksData.length > 0) {
        const defaultBank = banksData.find((b) => b.is_default) || banksData[0];
        setSelectedBankId(defaultBank.id);
      }
    } catch (err) {
      console.warn('Failed to load earnings data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived statistics
  const stats = useMemo(() => {
    let totalEarned = 0;
    let totalWithdrawn = 0;

    for (const tx of transactions) {
      const amt = Number(tx.amount || 0);
      if (tx.type === 'CREDIT' || tx.type === 'ESCROW_RELEASE') {
        totalEarned += amt;
      } else if (tx.type === 'PAYOUT' || tx.type === 'DEBIT') {
        totalWithdrawn += amt;
      }
    }

    return { totalEarned, totalWithdrawn };
  }, [transactions]);

  // Filtered transactions
  const filteredList = useMemo(() => {
    if (activeTab === 'INCOME') {
      return transactions.filter(
        (t) => t.type === 'CREDIT' || t.type === 'ESCROW_RELEASE'
      );
    }
    if (activeTab === 'PAYOUT') {
      return transactions.filter((t) => t.type === 'PAYOUT' || t.type === 'DEBIT');
    }
    return transactions;
  }, [transactions, activeTab]);

  // Handle Request Payout
  const handleConfirmPayout = async () => {
    const amountNum = parseFloat(payoutAmount.replace(/\D/g, ''));
    if (!amountNum || isNaN(amountNum) || amountNum < 50000) {
      Alert.alert('Số tiền không hợp lệ', 'Số tiền rút tối thiểu là 50.000 đ.');
      return;
    }

    if (amountNum > wallet.balance) {
      Alert.alert('Số dư không đủ', 'Số tiền yêu cầu vượt quá số dư khả dụng.');
      return;
    }

    if (!selectedBankId) {
      Alert.alert('Chưa chọn tài khoản', 'Vui lòng thêm hoặc chọn tài khoản ngân hàng nhận tiền.');
      return;
    }

    setIsSubmittingPayout(true);
    try {
      await walletApi.requestPayout(amountNum, selectedBankId);
      Alert.alert(
        'Tạo yêu cầu thành công',
        `Yêu cầu rút ${formatCurrency(amountNum)} đ đã được gửi và đang chờ hệ thống xử lý chuyển khoản.`
      );
      setShowPayoutModal(false);
      setPayoutAmount('');
      fetchData(false);
    } catch (err: any) {
      Alert.alert('Lỗi rút tiền', err?.response?.data?.message || 'Không thể tạo yêu cầu rút tiền.');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Handle Add Bank Account
  const handleSaveBankAccount = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đủ Tên ngân hàng, Số tài khoản và Tên chủ thẻ.');
      return;
    }

    setIsSubmittingBank(true);
    try {
      const newBank = await walletApi.addBankAccount({
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim().toUpperCase(),
        branch: branch.trim() || undefined,
        is_default: bankAccounts.length === 0,
      });

      if (newBank) {
        Alert.alert('Thành công', 'Đã lưu tài khoản ngân hàng thành công.');
        setBankAccounts((prev) => [...prev, newBank]);
        setSelectedBankId(newBank.id);
        setShowAddBankModal(false);
        setBankName('');
        setAccountNumber('');
        setAccountName('');
        setBranch('');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể thêm tài khoản ngân hàng.');
    } finally {
      setIsSubmittingBank(false);
    }
  };

  // Handle Test Topup
  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) return;

    setIsSubmittingTopup(true);
    try {
      await walletApi.topup(amt);
      Alert.alert('Nạp tiền thành công', `Đã cộng ${formatCurrency(amt)} đ vào ví.`);
      setShowTopupModal(false);
      fetchData(false);
    } catch (err: any) {
      Alert.alert('Lỗi nạp tiền', err?.response?.data?.message || 'Không thể nạp tiền.');
    } finally {
      setIsSubmittingTopup(false);
    }
  };

  const formatTxDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <Screen
      withPadding={false}
      backgroundColor="#F8F9FF"
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <Wallet size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Thu nhập & Doanh thu</Text>
            <Text style={styles.headerSubtitle}>Quản lý số dư ví & tài khoản nhận tiền</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchData(true)}
            activeOpacity={0.7}
          >
            <RefreshCw size={18} color="#0B2A4A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchData(true)} colors={['#0B2A4A']} />
        }
      >
        {/* 1. HERO BALANCE CARD */}
        <View style={styles.heroCard}>
          {/* Top Row: Label & Test Topup */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <ShieldCheck size={14} color="#00A472" />
              <Text style={styles.heroBadgeText}>Ví đảm bảo PetCare</Text>
            </View>
            <TouchableOpacity
              style={styles.testTopupBtn}
              onPress={() => setShowTopupModal(true)}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.testTopupText}>Nạp thử</Text>
            </TouchableOpacity>
          </View>

          {/* Available Balance */}
          <Text style={styles.balanceLabel}>SỐ DƯ KHẢ DỤNG</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet.balance)} đ</Text>

          {/* Pending Escrow Sub-row */}
          <View style={styles.pendingRow}>
            <Clock size={15} color="#FFDEA5" style={{ marginTop: 1 }} />
            <Text style={styles.pendingText}>
              Đang chờ tất toán (Escrow):{' '}
              <Text style={styles.pendingBold}>{formatCurrency(wallet.pendingBalance)} đ</Text>
            </Text>
          </View>

          <Text style={styles.escrowHint}>
            * Tiền tạm giữ sẽ tự động giải ngân vào số dư khả dụng ngay khi khách hàng xác nhận nghiệm thu.
          </Text>

          {/* Actions on Card */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setShowPayoutModal(true)}
              activeOpacity={0.88}
            >
              <ArrowUpRight size={18} color="#00152D" />
              <Text style={styles.withdrawBtnText}>Rút tiền về ngân hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addBankBtn}
              onPress={() => setShowAddBankModal(true)}
              activeOpacity={0.85}
            >
              <Building2 size={16} color="#FFFFFF" />
              <Text style={styles.addBankBtnText}>
                {bankAccounts.length > 0 ? `${bankAccounts.length} Ngân hàng` : '+ Thêm thẻ'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. STATS MINI SUMMARY */}
        <View style={styles.statsSummaryRow}>
          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E6F8F0' }]}>
              <TrendingUp size={16} color="#00A472" />
            </View>
            <Text style={styles.statBoxLabel}>Tổng thu nhận</Text>
            <Text style={styles.statBoxValue}>{formatCurrency(stats.totalEarned)} đ</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFF4E5' }]}>
              <ArrowUpRight size={16} color="#B76E00" />
            </View>
            <Text style={styles.statBoxLabel}>Đã rút tiền</Text>
            <Text style={styles.statBoxValue}>{formatCurrency(stats.totalWithdrawn)} đ</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF4FF' }]}>
              <CreditCard size={16} color="#0B2A4A" />
            </View>
            <Text style={styles.statBoxLabel}>Giao dịch</Text>
            <Text style={styles.statBoxValue}>{transactions.length}</Text>
          </View>
        </View>

        {/* 3. TABS */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              Tất cả ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'INCOME' && styles.tabBtnActive]}
            onPress={() => setActiveTab('INCOME')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'INCOME' && styles.tabTextActive]}>
              Thu nhập (+)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PAYOUT' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PAYOUT')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'PAYOUT' && styles.tabTextActive]}>
              Rút tiền (-)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'REQUESTS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('REQUESTS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'REQUESTS' && styles.tabTextActive]}>
              Lệnh rút ({payoutRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. CONTENT LIST */}
        {isLoading ? (
          <View style={styles.centeredLoading}>
            <ActivityIndicator size="large" color="#0B2A4A" />
            <Text style={styles.loadingText}>Đang đồng bộ số dư & giao dịch...</Text>
          </View>
        ) : activeTab === 'REQUESTS' ? (
          // Payout Requests List
          <View style={styles.listContainer}>
            {payoutRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Clock size={40} color="#74777F" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Chưa có lệnh rút tiền nào</Text>
                <Text style={styles.emptySubtitle}>
                  Khi bạn gửi yêu cầu rút tiền về tài khoản ngân hàng, trạng thái xử lý sẽ hiển thị tại đây.
                </Text>
              </View>
            ) : (
              payoutRequests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestCardHeader}>
                    <View style={styles.requestBankInfo}>
                      <Building2 size={16} color="#0B2A4A" />
                      <Text style={styles.requestBankName}>{req.bank_details?.bank_name}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        req.status === 'PAYOUT_APPROVED'
                          ? styles.statusApproved
                          : req.status === 'PAYOUT_REJECTED'
                          ? styles.statusRejected
                          : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          req.status === 'PAYOUT_APPROVED'
                            ? styles.statusTextApproved
                            : req.status === 'PAYOUT_REJECTED'
                            ? styles.statusTextRejected
                            : styles.statusTextPending,
                        ]}
                      >
                        {req.status === 'PAYOUT_APPROVED'
                          ? 'Đã chuyển'
                          : req.status === 'PAYOUT_REJECTED'
                          ? 'Từ chối'
                          : 'Đang xử lý'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestCardBody}>
                    <Text style={styles.requestAmount}>-{formatCurrency(req.amount)} đ</Text>
                    <Text style={styles.requestAccountInfo}>
                      STK: {req.bank_details?.account_number} • {req.bank_details?.account_name}
                    </Text>
                    <Text style={styles.requestDate}>{formatTxDate(req.created_at)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          // Ledger Transactions List
          <View style={styles.listContainer}>
            {filteredList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Wallet size={40} color="#74777F" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Chưa có biến động số dư</Text>
                <Text style={styles.emptySubtitle}>
                  Thu nhập từ các đơn dịch vụ đã hoàn tất nghiệm thu sẽ tự động cộng vào ví của bạn.
                </Text>
              </View>
            ) : (
              filteredList.map((tx) => {
                const isPositive = tx.type === 'CREDIT' || tx.type === 'ESCROW_RELEASE';
                return (
                  <View key={tx.id} style={styles.txCard}>
                    <View
                      style={[
                        styles.txIconBox,
                        { backgroundColor: isPositive ? '#E6F8F0' : '#FFF4E5' },
                      ]}
                    >
                      {isPositive ? (
                        <ArrowDownLeft size={18} color="#00A472" />
                      ) : (
                        <ArrowUpRight size={18} color="#B76E00" />
                      )}
                    </View>

                    <View style={styles.txMeta}>
                      <Text style={styles.txDescription} numberOfLines={1}>
                        {tx.description ||
                          (tx.type === 'ESCROW_RELEASE'
                            ? 'Thanh toán hoàn tất dịch vụ'
                            : tx.type === 'PAYOUT'
                            ? 'Rút tiền về ngân hàng'
                            : 'Biến động số dư')}
                      </Text>
                      <Text style={styles.txDate}>{formatTxDate(tx.created_at)}</Text>
                    </View>

                    <Text
                      style={[
                        styles.txAmount,
                        { color: isPositive ? '#00A472' : '#0B1C30' },
                      ]}
                    >
                      {isPositive ? '+' : '-'}
                      {formatCurrency(tx.amount)} đ
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: REQUEST PAYOUT */}
      <Modal
        visible={showPayoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rút tiền về tài khoản ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                <X size={20} color="#74777F" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Balance Box */}
              <View style={styles.modalBalanceBox}>
                <Text style={styles.modalBalanceLabel}>Số dư khả dụng để rút:</Text>
                <Text style={styles.modalBalanceVal}>{formatCurrency(wallet.balance)} đ</Text>
              </View>

              {/* Amount Input */}
              <Text style={styles.inputFieldLabel}>SỐ TIỀN MUỐN RÚT (VNĐ)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tối thiểu 50.000 đ"
                  placeholderTextColor="#74777F"
                  keyboardType="numeric"
                  value={payoutAmount}
                  onChangeText={setPayoutAmount}
                />
              </View>

              {/* Quick Amount Chips */}
              <View style={styles.chipsRow}>
                {[100000, 200000, 500000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.chipBtn}
                    onPress={() => setPayoutAmount(amt.toString())}
                  >
                    <Text style={styles.chipBtnText}>{formatCurrency(amt)} đ</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.chipBtn, styles.chipBtnMax]}
                  onPress={() => setPayoutAmount(wallet.balance.toString())}
                >
                  <Text style={[styles.chipBtnText, styles.chipBtnTextMax]}>Tất cả</Text>
                </TouchableOpacity>
              </View>

              {/* Select Bank Account */}
              <Text style={styles.inputFieldLabel}>TÀI KHOẢN NGÂN HÀNG THỤ HƯỞNG</Text>
              {bankAccounts.length === 0 ? (
                <View style={styles.noBankWarningBox}>
                  <AlertCircle size={18} color="#B76E00" />
                  <Text style={styles.noBankWarningText}>
                    Bạn chưa lưu tài khoản ngân hàng nào. Vui lòng thêm tài khoản để tiếp tục rút tiền.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalAddBankAction}
                    onPress={() => {
                      setShowPayoutModal(false);
                      setShowAddBankModal(true);
                    }}
                  >
                    <Text style={styles.modalAddBankActionText}>+ Thêm tài khoản ngay</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                bankAccounts.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.bankSelectCard,
                      selectedBankId === b.id && styles.bankSelectCardActive,
                    ]}
                    onPress={() => setSelectedBankId(b.id)}
                    activeOpacity={0.8}
                  >
                    <Building2 size={20} color={selectedBankId === b.id ? '#0B2A4A' : '#74777F'} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.bankSelectName}>{b.bank_name}</Text>
                      <Text style={styles.bankSelectNum}>
                        {b.account_number} • {b.account_name}
                      </Text>
                    </View>
                    {selectedBankId === b.id && <CheckCircle2 size={18} color="#00A472" />}
                  </TouchableOpacity>
                ))
              )}

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmPayoutBtn,
                  (!payoutAmount || !selectedBankId || isSubmittingPayout) && styles.btnDisabled,
                ]}
                onPress={handleConfirmPayout}
                disabled={!payoutAmount || !selectedBankId || isSubmittingPayout}
                activeOpacity={0.88}
              >
                {isSubmittingPayout ? (
                  <ActivityIndicator size="small" color="#00152D" />
                ) : (
                  <Text style={styles.confirmPayoutBtnText}>Xác nhận gửi yêu cầu rút tiền</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ADD BANK ACCOUNT */}
      <Modal
        visible={showAddBankModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm tài khoản ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
                <X size={20} color="#74777F" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputFieldLabel}>TÊN NGÂN HÀNG (VD: Vietcombank, MB, Techcombank)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập tên ngân hàng..."
                  placeholderTextColor="#74777F"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <Text style={styles.inputFieldLabel}>SỐ TÀI KHOẢN</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số tài khoản ngân hàng..."
                  placeholderTextColor="#74777F"
                  keyboardType="numeric"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
              </View>

              <Text style={styles.inputFieldLabel}>TÊN CHỦ TÀI KHOẢN (KHÔNG DẤU)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="VD: NGUYEN VAN A"
                  placeholderTextColor="#74777F"
                  autoCapitalize="characters"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              <Text style={styles.inputFieldLabel}>CHI NHÁNH (TÙY CHỌN)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="VD: Chi nhánh TP.HCM"
                  placeholderTextColor="#74777F"
                  value={branch}
                  onChangeText={setBranch}
                />
              </View>

              <TouchableOpacity
                style={[styles.confirmPayoutBtn, isSubmittingBank && styles.btnDisabled]}
                onPress={handleSaveBankAccount}
                disabled={isSubmittingBank}
                activeOpacity={0.88}
              >
                {isSubmittingBank ? (
                  <ActivityIndicator size="small" color="#00152D" />
                ) : (
                  <Text style={styles.confirmPayoutBtnText}>Lưu thông tin ngân hàng</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: TEST TOPUP (DEV / TEST) */}
      <Modal
        visible={showTopupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTopupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: 320 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp số dư thử nghiệm</Text>
              <TouchableOpacity onPress={() => setShowTopupModal(false)}>
                <X size={20} color="#74777F" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputFieldLabel}>CHỌN SỐ TIỀN NẠP VÀO VÍ</Text>
            <View style={styles.chipsRow}>
              {['200000', '500000', '1000000', '2000000'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.chipBtn, topupAmount === amt && styles.chipBtnActive]}
                  onPress={() => setTopupAmount(amt)}
                >
                  <Text style={[styles.chipBtnText, topupAmount === amt && styles.chipBtnTextActive]}>
                    {formatCurrency(amt)} đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmPayoutBtn, isSubmittingTopup && styles.btnDisabled, { marginTop: 24 }]}
              onPress={handleTopup}
              disabled={isSubmittingTopup}
              activeOpacity={0.88}
            >
              {isSubmittingTopup ? (
                <ActivityIndicator size="small" color="#00152D" />
              ) : (
                <Text style={styles.confirmPayoutBtnText}>Xác nhận nạp số dư</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4FF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0B2A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1C30',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0B2A4A',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0B2A4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  testTopupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  testTopupText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  pendingBold: {
    fontWeight: '700',
    color: '#FFDEA5',
  },
  escrowHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  withdrawBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFDEA5',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  withdrawBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00152D',
  },
  addBankBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  addBankBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statBoxValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1C30',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E5EEFF',
  },
  tabBtnActive: {
    backgroundColor: '#0B2A4A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B2A4A',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    gap: 10,
  },
  centeredLoading: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1C30',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txMeta: {
    flex: 1,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  txDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFF4FF',
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestBankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestBankName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: '#FFF4E5',
  },
  statusApproved: {
    backgroundColor: '#E6F8F0',
  },
  statusRejected: {
    backgroundColor: '#FDE8E8',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#B76E00',
  },
  statusTextApproved: {
    color: '#00A472',
  },
  statusTextRejected: {
    color: '#E02424',
  },
  requestCardBody: {},
  requestAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
  },
  requestAccountInfo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  requestDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 21, 45, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1C30',
  },
  modalBalanceBox: {
    backgroundColor: '#EFF4FF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalBalanceLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  modalBalanceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2A4A',
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 8,
  },
  inputContainer: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: '#0B1C30',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  chipBtn: {
    backgroundColor: '#EFF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipBtnActive: {
    backgroundColor: '#0B2A4A',
  },
  chipBtnMax: {
    backgroundColor: '#FFDEA5',
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B2A4A',
  },
  chipBtnTextActive: {
    color: '#FFFFFF',
  },
  chipBtnTextMax: {
    color: '#00152D',
  },
  noBankWarningBox: {
    backgroundColor: '#FFF4E5',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
  },
  noBankWarningText: {
    fontSize: 12,
    color: '#7B5800',
    marginTop: 4,
    lineHeight: 18,
  },
  modalAddBankAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  modalAddBankActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B2A4A',
    textDecorationLine: 'underline',
  },
  bankSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  bankSelectCardActive: {
    borderColor: '#0B2A4A',
    backgroundColor: '#EFF4FF',
  },
  bankSelectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  bankSelectNum: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  confirmPayoutBtn: {
    backgroundColor: '#FFDEA5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  confirmPayoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00152D',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
