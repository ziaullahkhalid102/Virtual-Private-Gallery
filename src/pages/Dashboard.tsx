import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Upload, Image as ImageIcon, Video, Music, Trash2, X, Home, Folder, Shield, User as UserIcon, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const isUploading = uploads.some(u => u.status === 'uploading');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/gallery', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return;
        }
        throw new Error('Failed to fetch media');
      }
      const data = await res.json();
      setMedia(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');

    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    newUploads.forEach(uploadTask => {
      const formData = new FormData();
      formData.append('file', uploadTask.file as Blob);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/gallery/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploads(prev => prev.map(u => 
            u.id === uploadTask.id ? { ...u, progress: percentComplete } : u
          ));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setMedia(prev => [data.media, ...prev]);
          setUploads(prev => prev.map(u => 
            u.id === uploadTask.id ? { ...u, status: 'success', progress: 100 } : u
          ));
          
          setTimeout(() => {
            setUploads(prev => prev.filter(u => u.id !== uploadTask.id));
          }, 4000);
        } else {
          let errorMsg = 'Upload failed';
          try {
            errorMsg = JSON.parse(xhr.responseText).error || errorMsg;
          } catch (e) {}
          setUploads(prev => prev.map(u => 
            u.id === uploadTask.id ? { ...u, status: 'error', error: errorMsg } : u
          ));
        }
      };

      xhr.onerror = () => {
        setUploads(prev => prev.map(u => 
          u.id === uploadTask.id ? { ...u, status: 'error', error: 'Network error' } : u
        ));
      };

      xhr.send(formData);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete');
      
      setMedia(media.filter(m => m.id !== id));
      if (selectedMedia?.id === id) setSelectedMedia(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-400" />;
    if (mimetype.startsWith('video/')) return <Video className="w-8 h-8 text-purple-400" />;
    if (mimetype.startsWith('audio/')) return <Music className="w-8 h-8 text-green-400" />;
    return <ImageIcon className="w-8 h-8 text-zinc-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalBytesUsed = media.reduce((sum, item) => sum + item.size, 0);
  const maxStorageBytes = 5 * 1024 * 1024 * 1024; // 5 GB
  const storagePercentage = Math.min(100, (totalBytesUsed / maxStorageBytes) * 100);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar (Desktop only) */}
      <aside className="hidden md:flex w-[260px] bg-slate-900 text-white flex-col p-6 shrink-0">
        <div className="text-xl font-bold mb-10 flex items-center gap-2.5 text-white">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span>VPG Private</span>
        </div>
        
        <nav className="flex-1">
          <a href="#" className="flex items-center px-4 py-3 rounded-lg mb-1 bg-white/10 text-white text-sm font-medium">Dashboard</a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg mb-1 text-slate-200 hover:bg-white/5 text-sm font-medium transition-colors">All Media</a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg mb-1 text-slate-200 hover:bg-white/5 text-sm font-medium transition-colors">Categories</a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg mb-1 text-slate-200 hover:bg-white/5 text-sm font-medium transition-colors">Security Settings</a>
          <a href="#" className="flex items-center px-4 py-3 rounded-lg mb-1 text-slate-200 hover:bg-white/5 text-sm font-medium transition-colors">Profile Info</a>
        </nav>

        <div className="bg-white/5 rounded-xl p-4 mt-auto">
          <span className="text-xs text-slate-100 mb-2 block">Gallery Storage</span>
          <div className="h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${storagePercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-200">
            <span>{formatSize(totalBytesUsed)} used</span>
            <span>5 GB limit</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        <header className="h-[72px] border-b border-slate-200 flex items-center justify-between px-4 md:px-10 bg-white shrink-0">
          <div className="font-medium text-slate-700 truncate mr-4">Welcome, {user?.firstName} {user?.lastName}</div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <span className="hidden sm:inline-block text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 border border-slate-200">
              ID: VPG-{user?.id?.toString().padStart(4, '0')}-QR
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors ml-1 md:ml-2 shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-4 md:p-10 flex-1 overflow-y-auto pb-24 md:pb-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 text-sm">
              {error}
            </div>
          )}

          {/* Security Banner */}
          <div className="bg-emerald-500 text-white px-5 py-3 rounded-xl mb-8 flex items-center justify-between text-sm shadow-sm">
            <span><strong>Vault Secure:</strong> All data is encrypted and isolated to your user ID. End-to-end privacy guaranteed.</span>
            <span className="opacity-80 cursor-pointer hover:opacity-100 transition-opacity">Learn more &rarr;</span>
          </div>

          {/* Summary Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="text-xs uppercase tracking-wider text-slate-700 mb-2 block font-medium">Total Files</span>
              <div className="text-2xl font-bold text-slate-900">{media.length}</div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="text-xs uppercase tracking-wider text-slate-700 mb-2 block font-medium">Recent Activity</span>
              <div className="text-2xl font-bold text-slate-900">
                {media.filter(m => new Date(m.uploadDate).getTime() > Date.now() - 86400000).length} Uploads
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="text-xs uppercase tracking-wider text-slate-700 mb-2 block font-medium">Security Status</span>
              <div className="text-2xl font-bold text-emerald-500">Verified</div>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Last Uploaded Files</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors shadow-sm items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload New
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">Your gallery is empty</h3>
              <p className="text-slate-500 mb-6 text-sm">Upload your first image, video, or audio file to get started.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Select Files
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors hover:border-slate-300 cursor-pointer group flex flex-col shadow-sm"
                >
                  <div className="h-[140px] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    <span className="absolute top-2.5 right-2.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded uppercase z-10 font-medium tracking-wider">
                      {item.mimetype.split('/')[0].substring(0, 3)}
                    </span>
                    {item.mimetype.startsWith('image/') ? (
                      <img
                        src={`/uploads/${item.filename}`}
                        alt={item.originalName}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      getIcon(item.mimetype)
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors shadow-sm"
                        title="Delete file"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis mb-1 text-slate-900" title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatSize(item.size)} • {new Date(item.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Mobile FAB for Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-blue-700 active:scale-95 transition-transform"
          title="Upload New"
        >
          {isUploading ? (
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/30 border-t-white"></div>
              <span className="absolute text-[10px] font-bold">{uploads.filter(u => u.status === 'uploading').length}</span>
            </div>
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </button>

        {/* Upload Manager */}
        {uploads.length > 0 && (
          <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-[calc(100vw-32px)] md:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-96">
            <div className="bg-slate-900 text-white px-4 py-3 text-sm font-medium flex justify-between items-center">
              <span>Uploading {uploads.filter(u => u.status === 'uploading').length} files</span>
              <button onClick={() => setUploads([])} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-2 bg-slate-50">
              {uploads.map(u => (
                <div key={u.id} className="p-3 mb-2 last:mb-0 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="truncate pr-2 font-medium text-slate-700">{u.file.name}</span>
                    <span className="text-slate-500 shrink-0 font-medium">
                      {u.status === 'uploading' ? `${u.progress}%` : u.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${u.status === 'error' ? 'bg-red-500' : u.status === 'success' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${u.progress}%` }}
                    ></div>
                  </div>
                  {u.status === 'error' && <div className="text-[10px] text-red-500 mt-1.5 font-medium">{u.error}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-40 pb-safe">
          <a href="#" className="flex flex-col items-center justify-center w-full h-full text-blue-600">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600">
            <ImageIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Media</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600">
            <Folder className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Folders</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600">
            <UserIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </a>
        </nav>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-white/10 rounded-full transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center relative">
            {selectedMedia.mimetype.startsWith('image/') && (
              <img
                src={`/uploads/${selectedMedia.filename}`}
                alt={selectedMedia.originalName}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
            )}
            {selectedMedia.mimetype.startsWith('video/') && (
              <video
                src={`/uploads/${selectedMedia.filename}`}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-xl shadow-2xl bg-black"
              />
            )}
            {selectedMedia.mimetype.startsWith('audio/') && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 w-full max-w-md text-center shadow-xl">
                <Music className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-lg font-bold text-slate-900 mb-6 truncate">{selectedMedia.originalName}</h3>
                <audio
                  src={`/uploads/${selectedMedia.filename}`}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
            )}
            <div className="mt-6 flex items-center justify-between gap-4 bg-slate-900/80 backdrop-blur px-6 py-4 rounded-xl border border-white/10 w-full max-w-2xl">
              <div className="text-left overflow-hidden">
                <p className="text-white font-medium truncate" title={selectedMedia.originalName}>{selectedMedia.originalName}</p>
                <p className="text-slate-300 text-sm mt-1">
                  Uploaded on {new Date(selectedMedia.uploadDate).toLocaleDateString()} • {formatSize(selectedMedia.size)}
                </p>
              </div>
              <a
                href={`/uploads/${selectedMedia.filename}`}
                download={selectedMedia.originalName}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
