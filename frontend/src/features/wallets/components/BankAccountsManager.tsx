import React, { useState } from 'react';
import { useBankAccounts } from '../../provider/hooks/useBankAccounts';
import { AddBankAccountModal } from './AddBankAccountModal';

export const BankAccountsManager = () => {
  const { bankAccounts, isLoading, setDefaultAccount } = useBankAccounts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Thẻ & Tài khoản ngân hàng</h3>
          <p className="text-sm text-slate-500 mt-1">Quản lý các tài khoản nhận tiền rút về của bạn</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Thêm thẻ mới
        </button>
      </div>

      {isLoading && bankAccounts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
          <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <p className="text-slate-600 font-medium text-sm mb-1">Chưa có tài khoản ngân hàng nào</p>
          <p className="text-slate-400 text-xs">Vui lòng thêm tài khoản để có thể rút tiền</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((account) => (
            <div 
              key={account.id} 
              className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                account.is_default 
                  ? 'bg-emerald-50/30 border-emerald-500 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-300'
              }`}
            >
              {account.is_default && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Mặc định
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{account.bank_name}</h4>
                  <p className="text-slate-500 text-xs mt-0.5">{account.branch || 'Hội sở chính'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-mono tracking-widest text-slate-700 font-medium">
                  {account.account_number.replace(/(\d{4})/g, '$1 ').trim()}
                </p>
                <p className="text-sm font-semibold text-slate-600 uppercase">
                  {account.account_name}
                </p>
              </div>

              {!account.is_default && (
                <button
                  onClick={() => setDefaultAccount(account.id)}
                  className="absolute bottom-4 right-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-3 py-1.5 rounded-lg"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AddBankAccountModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
