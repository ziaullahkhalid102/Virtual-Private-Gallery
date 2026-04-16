import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Shield, ShieldAlert, ShieldCheck, Eye, Trash2, Search, Key, X, Image as ImageIcon, Video, Music } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  username: string;
  role: string;
  status: 'active' | 'blocked';
}

interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserMedia, setSelectedUserMedia] = useState<{ user: User; media: Media[] } | null>(null);
  const [showResetModal, setShowResetModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const adminStr = localStorage.getItem('user');
  const admin = adminStr ? JSON.parse(adminStr) : null;

  useEffect(() => {
    if (admin?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewMedia = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/media`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user media');
      const media = await res.json();
      setSelectedUserMedia({ user, media });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;

    try {
      const res = await fetch(`/api/admin/users/${showResetModal.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset password');
      }
      alert('Password reset successfully');
      setShowResetModal(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="h-[72px] border-b border-slate-200 flex items-center justify-between px-6 md:px-10 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">Admin Control</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <div className="text-sm font-bold text-slate-900">{admin?.firstName} {admin?.lastName}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">System Administrator</div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
              <span className="text-sm font-medium text-slate-500">Total Users</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
              <span className="text-sm font-medium text-slate-500">Active Accounts</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{users.filter(u => u.status === 'active').length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
              <span className="text-sm font-medium text-slate-500">Blocked Accounts</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{users.filter(u => u.status === 'blocked').length}</div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">User Management</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-500">{user.dob}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.country}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewMedia(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors" 
                          title="Review Media"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowResetModal(user)}
                          className="p-2 text-slate-400 hover:text-orange-600 transition-colors" 
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 transition-colors ${
                            user.status === 'active' ? 'text-slate-400 hover:text-red-600' : 'text-emerald-400 hover:text-emerald-600'
                          }`}
                          title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                        >
                          {user.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Media Review Modal */}
      {selectedUserMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Security Review: {selectedUserMedia.user.username}</h3>
                <p className="text-sm text-slate-500">Reviewing {selectedUserMedia.media.length} files for security compliance</p>
              </div>
              <button onClick={() => setSelectedUserMedia(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {selectedUserMedia.media.length === 0 ? (
                <div className="text-center py-20 text-slate-400">No media found for this user.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedUserMedia.media.map(item => (
                    <div key={item.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                      <div className="h-32 bg-slate-200 flex items-center justify-center relative">
                        {item.mimetype.startsWith('image/') ? (
                          <img src={`/uploads/${item.filename}`} className="w-full h-full object-cover" alt="" />
                        ) : item.mimetype.startsWith('video/') ? (
                          <Video className="w-8 h-8 text-slate-400" />
                        ) : (
                          <Music className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="p-2 text-[10px] text-slate-600 truncate font-medium">{item.originalName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reset User Password</h3>
            <p className="text-sm text-slate-500 mb-6">Setting new password for <strong>{showResetModal.username}</strong></p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
