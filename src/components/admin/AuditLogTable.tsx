import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../../types';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { supabase } from '../../config/supabase';
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

    const channel = supabase
      .channel('audit-logs-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        () => { fetchLogs(); }
      )
      .subscribe();

    const poll = setInterval(fetchLogs, 30000);

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'upload': return <span className="text-white bg-green-600 border-2 border-green-600 px-2 py-0.5 text-[10px] font-bold">INGEST</span>;
      case 'delete': return <span className="text-white bg-[#FF3B30] border-2 border-[#FF3B30] px-2 py-0.5 text-[10px] font-bold">PURGE</span>;
      case 'rename': return <span className="text-white bg-blue-600 border-2 border-blue-600 px-2 py-0.5 text-[10px] font-bold">RENAME</span>;
      case 'deploy': return <span className="text-white bg-green-600 border-2 border-green-600 px-2 py-0.5 text-[10px] font-bold">DEPLOY</span>;
      case 'undeploy': return <span className="text-black bg-amber-400 border-2 border-amber-400 px-2 py-0.5 text-[10px] font-bold">DRAFT</span>;
      case 'edit_meta': return <span className="text-white bg-blue-600 border-2 border-blue-600 px-2 py-0.5 text-[10px] font-bold">META</span>;
      default: return <span className="text-black bg-white border-2 border-black px-2 py-0.5 text-[10px] font-bold">ACTION</span>;
    }
  };

  return (
    <div className="bg-white border-3 border-black p-6 mb-8">
      <div onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-between cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-black" />
          <h3 className="text-black font-display font-bold tracking-wider text-xs uppercase">AUDIT TRANSACTION LOGS</h3>
          <span className="text-[10px] font-mono text-neutral-700 font-bold">/ SYSTEM LEDGER ({logs.length} REGISTERED)</span>
        </div>
        <button className="text-black hover:text-[#FF3B30]">{collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}</button>
      </div>
      {!collapsed && (
        <div className="mt-6 border-t-2 border-black pt-4">
          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-neutral-700 uppercase tracking-wider font-bold">Syncing terminal transactions ledger...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-neutral-700 font-bold">NO TRANSACTIONS COMMITTED YET</div>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left font-mono text-[10px] select-none border-collapse">
                <thead>
                  <tr className="border-b-2 border-black text-neutral-700 uppercase tracking-wider select-text pb-2 font-bold">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Executor Identity</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Target Asset</th>
                    <th className="py-2.5 px-3 text-right">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black text-neutral-700">
                  {logs.slice(0, 50).map((log) => {
                    const displayTime = new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    const displayDay = new Date(log.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
                    return (
                      <tr key={log.id} className="hover:bg-neutral-100 transition-colors">
                        <td className="py-2 px-3 whitespace-nowrap text-black flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3 text-black shrink-0" />
                          <span>{displayDay} {displayTime}</span>
                        </td>
                        <td className="py-2 px-3 text-black font-bold max-w-[120px] truncate" title={log.performed_by}>{log.performed_by.split('@')[0]}</td>
                        <td className="py-2 px-3">{getActionBadge(log.action)}</td>
                        <td className="py-2 px-3 hover:text-[#FF3B30] truncate max-w-[180px] font-bold" title={log.file_name}>{log.file_name}</td>
                        <td className="py-2 px-3 text-right text-neutral-500 uppercase font-bold">{log.id.slice(0, 8)}</td>
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
