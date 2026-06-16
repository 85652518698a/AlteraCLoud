import { useEffect, useState } from 'react';
import { callEdgeFunction } from '../lib/edgeFunction';
import { AuditLog } from '../types';

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await callEdgeFunction<AuditLog[]>('get-audit-logs', {});
        setLogs(data);
      } catch (err) {
        console.error('Audit log fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return { logs, loading };
}
