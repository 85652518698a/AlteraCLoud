import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../../types';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { Clock, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export const AuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await callEdgeFunction<AuditLog[]>('get-audit-logs', {});
      setLogs(data);
    } catch (err) {
      console.error('Audit sync issue', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const poll = setInterval(fetchLogs, 20000);
    return () => clearInterval(poll);
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'upload': return <span className="text-emerald-500 border border-emerald-950/40 bg-emerald-950/10 px-2 py-0.5 rounded text-[10px] font-bold">INGEST</span>;
      case 'delete': return <span className="text-red-500 border border-red-950/40 bg-red-950/10 px-2 py-0.5 rounded text-[10px] font-bold">PURGE</span>;
      case 'rename': return <span className="text-amber-500 border border-amber-950/50 bg-amber-950/10 px-2 py-0.5 rounded text-[10px] font-bold">RENAME</span>;
      case 'deploy': return <span className="text-white border border-neutral-800 bg-neutral-900 px-2 py-0.5 rounded text-[10px] font-bold">DEPLOY</span>;
      case 'undeploy': return <span className="text-neutral-500 border border-neutral-900 bg-neutral-950 px-2 py-0.5 rounded text-[10px] font-bold">DRAFT</span>;
      case 'edit_meta': return <span className="text-blue-400 border border-blue-950 bg-blue-950/10 px-2 py-0.5 rounded text-[10px] font-bold">META</span>;
      default: return <span className="text-neutral-300 border border-neutral-900 px-2 py-0.5 rounded text-[10px] font-bold">ACTION</span>;
    }
  };

  return (
    <div className="bg-neutral-950/40 border border-neutral-900 rounded-lg p-6 mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-400" />
          <h3 className="text-zinc-200 font-display font-semibold tracking-wider text-xs uppercase">AUDIT TRANSACTION LOGS</h3>
          <span className="text-[10px] font-mono text-neutral-600">/ SYSTEM LEDGER ({logs.length} REGISTERED)</span>
        </div>
        <button className="text-neutral-500 hover:text-white">{collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}</button>
      </div>
      {!collapsed && (
        <div className="mt-6 border-t border-neutral-900/60 pt-4">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-neutral-500 uppercase tracking-wider animate-pulse">Syncing terminal transactions ledger...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-neutral-600">NO TRANSACTIONS COMMITTED YET</div>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left font-mono text-[10px] select-none border-collapse">
                <thead>
                  <tr className="border-b border-neutral-900/40 text-neutral-500 uppercase tracking-wider select-text pb-2 font-bold">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Executor Identity</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Target Asset</th>
                    <th className="py-2.5 px-3 text-right">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900/10 text-neutral-400">
                  {logs.slice(0, 50).map((log) => {
                    const displayTime = new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    const displayDay = new Date(log.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
                    return (
                      <tr key={log.id} className="hover:bg-neutral-950/80 transition-colors">
                        <td className="py-2 px-3 whitespace-nowrap text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-600 shrink-0" />
                          <span>{displayDay} {displayTime}</span>
                        </td>
                        <td className="py-2 px-3 text-zinc-300 font-semibold max-w-[120px] truncate" title={log.performed_by}>{log.performed_by.split('@')[0]}</td>
                        <td className="py-2 px-3">{getActionBadge(log.action)}</td>
                        <td className="py-2 px-3 hover:text-white truncate max-w-[180px]" title={log.file_name}>{log.file_name}</td>
                        <td className="py-2 px-3 text-right text-neutral-600 uppercase">{log.id.slice(0, 8)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
