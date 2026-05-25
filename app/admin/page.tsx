'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [stage, setStage] = useState<'prep' | 'secondary'>('prep');
  const [grade, setGrade] = useState(0);
  const [subject, setSubject] = useState('الجبر');
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [savedVideos, setSavedVideos] = useState<any[]>([]);

  const subjects: Record<string, string[][]> = {
    prep: [['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'حساب المثلثات']],
    secondary: [['الجبر', 'الهندسة', 'حساب المثلثات'], ['الجبر', 'التفاضل والتكامل', 'حساب المثلثات'], ['الجبر', 'الهندسة الفراغية', 'التفاضل والتكامل', 'الاستاتيكا', 'الديناميكا']]
  };
  const ADMIN_PASS = 'engmagdi2025';

  // تحميل الفيديوهات المحفوظة محلياً عند فتح الصفحة
  useEffect(() => {
    const videos = localStorage.getItem('admin_videos');
    if (videos) setSavedVideos(JSON.parse(videos));
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASS) { setIsAuth(true); setMsg({ type: 'success', text: '✅ تم الدخول بنجاح' }); } 
    else { setMsg({ type: 'error', text: '❌ كلمة المرور غير صحيحة' }); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true); 
    setMsg({ type: '', text: '' });
    
    const branchId = `${stage}-${grade}-${subject}`;
    const newVideo = { 
      id: Date.now().toString(),
      branch_id: branchId, 
      video_id: videoId, 
      title, 
      duration,
      savedAt: new Date().toISOString()
    };

    try {
      // ✅ الحفظ في localStorage (شغال 100% بدون سيرفر)
      const existing = JSON.parse(localStorage.getItem('admin_videos') || '[]');
      const updated = [newVideo, ...existing];
      localStorage.setItem('admin_videos', JSON.stringify(updated));
      setSavedVideos(updated);
      
      setMsg({ type: 'success', text: '✅ تم حفظ الفيديو بنجاح!' });
      setVideoId(''); setTitle(''); setDuration('');
    } catch (error) {
      console.error('Error:', error);
      setMsg({ type: 'error', text: '❌ فشل الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
        <div style={{ background: '#1e293b', padding: 40, borderRadius: 20, width: '90%', maxWidth: 400, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 20 }}>🔐 لوحة التحكم</h2>
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: '#0f172a', color: 'white', marginBottom: 16 }} />
          <button onClick={handleLogin} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#2563eb', color: 'white', border: 'none' }}>دخول</button>
          {msg.text && <p style={{ marginTop: 12, color: msg.type === 'error' ? '#ef4444' : '#10b981' }}>{msg.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: '20px 20px 100px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 30 }}>🎬 إضافة فيديو جديد</h1>
        
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 20, marginBottom: 30 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>المرحلة</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setStage('prep'); setGrade(0); setSubject(subjects.prep[0][0]); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: stage === 'prep' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'prep' ? '#eff6ff' : 'white' }}>الإعدادية</button>
              <button type="button" onClick={() => { setStage('secondary'); setGrade(0); setSubject(subjects.secondary[0][0]); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: stage === 'secondary' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'secondary' ? '#eff6ff' : 'white' }}>الثانوية</button>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>الصف</label>
            <select value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setSubject(subjects[stage][Number(e.target.value)][0]); }} style={{ width: '100%', padding: 12, borderRadius: 10 }}>
              {['الأول', 'الثاني', 'الثالث'].map((g, i) => <option key={i} value={i}>{g}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>المادة</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10 }}>
              {subjects[stage][grade].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Video ID</label>
            <input type="text" placeholder="94RTbe5stok" value={videoId} onChange={(e) => setVideoId(e.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 10 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>العنوان</label>
            <input type="text" placeholder="عنوان الفيديو" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 10 }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>المدة (اختياري)</label>
            <input type="text" placeholder="15:30" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10 }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, borderRadius: 12, background: loading ? '#94a3b8' : '#10b981', color: 'white', border: 'none' }}>
            {loading ? 'جاري الحفظ...' : '💾 حفظ الفيديو'}
          </button>
          {msg.text && <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', color: msg.type === 'error' ? '#dc2626' : '#16a34a', textAlign: 'center' }}>{msg.text}</div>}
        </form>

        {/* ✅ عرض الفيديوهات المحفوظة محلياً */}
        {savedVideos.length > 0 && (
          <div style={{ background: 'white', padding: 24, borderRadius: 20 }}>
            <h3 style={{ marginBottom: 16 }}>📋 الفيديوهات المحفوظة ({savedVideos.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {savedVideos.map((v) => (
                <div key={v.id} style={{ padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <strong>{v.title}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: 4 }}>
                    {v.branch_id} | ID: {v.video_id} {v.duration && `| ${v.duration}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}