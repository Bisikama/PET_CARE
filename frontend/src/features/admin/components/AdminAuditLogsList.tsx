'use client';

import * as React from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw, 
  Loader2, 
  FileText, 
  Code, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  User,
  ShieldCheck,
  Award,
  Lock,
  Unlock
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { Portal } from '@/components/ui/Portal';

export function AdminAuditLogsList() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(15);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [actionFilter, setActionFilter] = React.useState('');
  const [targetTypeFilter, setTargetTypeFilter] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAuditLogs({
        page,
        limit,
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setLogs(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải nhật ký hệ thống.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter, targetTypeFilter, fromDate, toDate]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const actionBadgeColors: Record<string, { label: string; bg: string; text: string }> = {
    SUSPEND_USER: { label: 'Khóa tài khoản', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    REACTIVATE_USER: { label: 'Mở khóa tài khoản', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    APPROVE_PROVIDER: { label: 'Duyệt kích hoạt đối tác', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
    REJECT_PROVIDER: { label: 'Từ chối/Đình chỉ đối tác', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    REVIEW_BULK_KYC: { label: 'Duyệt eKYC hàng loạt', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    AUTO_GRANT_BADGE: { label: 'Tự động cấp phù hiệu', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    GRANT_BADGE: { label: 'Cấp phù hiệu thủ công', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    REVOKE_BADGE: { label: 'Thu hồi phù hiệu', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header & Filter Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Nhật Ký Hệ Thống (Audit Logs)
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              API Nhật ký hệ thống bất biến: <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-[11px]">GET /api/admin/audit-logs</code>
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tải lại nhật ký
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Action Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Hành động</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition-all cursor-pointer"
            >
              <option value="">-- Tất cả hành động --</option>
              <option value="SUSPEND_USER">Khóa tài khoản (SUSPEND_USER)</option>
              <option value="REACTIVATE_USER">Mở khóa (REACTIVATE_USER)</option>
              <option value="APPROVE_PROVIDER">Duyệt đối tác (APPROVE_PROVIDER)</option>
              <option value="REJECT_PROVIDER">Từ chối đối tác (REJECT_PROVIDER)</option>
              <option value="REVIEW_BULK_KYC">Duyệt eKYC (REVIEW_BULK_KYC)</option>
              <option value="AUTO_GRANT_BADGE">Tự động cấp phù hiệu</option>
              <option value="GRANT_BADGE">Cấp phù hiệu thủ công</option>
              <option value="REVOKE_BADGE">Thu hồi phù hiệu</option>
            </select>
          </div>

          {/* Target Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Loại đối tượng</label>
            <input
              type="text"
              placeholder="VD: USER, provider_profiles..."
              value={targetTypeFilter}
              onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition-all"
            />
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition-all"
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-slate-800 transition-all"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs font-bold">Đang tải nhật ký hệ thống...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold">Không ghi nhận nhật ký nào theo bộ lọc này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Thời gian</th>
                  <th className="py-4 px-4">Hành động (Action)</th>
                  <th className="py-4 px-4">Tác nhân (Actor ID)</th>
                  <th className="py-4 px-4">Đối tượng tác động</th>
                  <th className="py-4 px-4">Lý do ghi nhận</th>
                  <th className="py-4 px-6 text-right">Chi tiết JSON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {logs.map((log) => {
                  const badgeInfo = actionBadgeColors[log.action] || {
                    label: log.action,
                    bg: 'bg-slate-100 border-slate-200',
                    text: 'text-slate-700',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDate(log.created_at || log.createdAt)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${badgeInfo.bg} ${badgeInfo.text}`}>
                          {badgeInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-600 truncate max-w-[140px]" title={log.actor_id || log.actorId || 'Hệ thống tự động'}>
                        {log.actor_id || log.actorId ? (log.actor_id || log.actorId).substring(0, 8) + '...' : '🤖 System Auto'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">{log.target_type || log.targetType}</span>
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={log.target_id || log.targetId}>
                            ID: {log.target_id || log.targetId || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-[200px] truncate" title={log.reason || 'N/A'}>
                        {log.reason || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5 text-indigo-500" />
                          Xem diff
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Tổng {total} bản ghi • Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
            <div className="relative w-full max-w-2xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl p-6 space-y-4 z-10 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-base font-extrabold text-white">Chi tiết bản ghi Nhật Ký Audit Log</h4>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><strong className="text-slate-400">Action:</strong> <span className="text-teal-400 font-bold">{selectedLog.action}</span></div>
                <div><strong className="text-slate-400">Target Type:</strong> <span className="text-indigo-300 font-bold">{selectedLog.target_type || selectedLog.targetType}</span></div>
                <div><strong className="text-slate-400">Actor ID:</strong> <span className="font-mono text-slate-300">{selectedLog.actor_id || selectedLog.actorId || 'SYSTEM'}</span></div>
                <div><strong className="text-slate-400">Target ID:</strong> <span className="font-mono text-slate-300">{selectedLog.target_id || selectedLog.targetId}</span></div>
              </div>

              {/* Old vs New JSON diff */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Giá trị cũ (old_value):</span>
                  <pre className="p-3 bg-slate-950 rounded-2xl font-mono text-[11px] text-rose-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(selectedLog.old_value || selectedLog.oldValue || null, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Giá trị mới (new_value):</span>
                  <pre className="p-3 bg-slate-950 rounded-2xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(selectedLog.new_value || selectedLog.newValue || null, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
