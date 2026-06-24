import React, { useState, useEffect, useCallback } from 'react';
import { callEdgeFunction } from '../../lib/edgeFunction';
import { ShieldCheck, ShieldAlert, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  added_by: string;
  created_at: string;
}

export const AdminUserManager: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await callEdgeFunction<AdminUser[]>('manage-admins', { action: 'list' });
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      await callEdgeFunction('manage-admins', { action: 'add', targetEmail: newEmail.trim() });
      toast.success(`Admin ${newEmail.trim()} added`);
      setNewEmail('');
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add admin');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (targetEmail: string) => {
    try {
      await callEdgeFunction('manage-admins', { action: 'remove', targetEmail });
      toast.success(`Removed ${targetEmail}`);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove admin');
    }
  };

  return (
    <div className="bg-white border-3 border-black p-6 mb-8">
      <div className="flex items-center gap-2 mb-4 select-none">
        <ShieldCheck className="w-4 h-4 text-black" />
        <h3 className="text-black font-display font-bold tracking-wider text-xs uppercase">ADMIN USER MANAGEMENT</h3>
        <span className="text-neutral-700 font-mono text-[9px] font-bold">/ ACCESS CONTROL</span>
      </div>

      <form onSubmit={handleAdd} className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-[10px] font-mono text-black font-bold uppercase mb-1.5 tracking-wider">Add New Admin Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-black">
              <Mail className="w-3.5 h-3.5" />
            </span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full pl-9 pr-4 py-2 bg-white border-2 border-black text-xs text-black placeholder-neutral-500 font-mono"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding || !newEmail.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-[#FF3B30] text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 border-2 border-black"
        >
          <Mail className="w-3.5 h-3.5" />
          Add
        </button>
      </form>

      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-black uppercase font-bold">Loading admin registry...</div>
      ) : admins.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-black font-bold">NO ADMINS REGISTERED</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] select-none border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-neutral-700 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Display Name</th>
                <th className="py-2.5 px-3">Added By</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-neutral-700">
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-100 transition-colors">
                  <td className="py-2.5 px-3 text-black font-bold">{a.email}</td>
                  <td className="py-2.5 px-3 text-black font-bold">{a.display_name}</td>
                  <td className="py-2.5 px-3 text-black font-bold">{a.added_by}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleRemove(a.email)}
                      className="text-black hover:text-[#FF3B30] transition-colors cursor-pointer p-1 border-2 border-black"
                      title="Remove admin"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
