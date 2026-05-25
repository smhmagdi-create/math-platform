'use client';
import { useState, useEffect } from 'react';

// ✅ رابط Google Apps Script بتاعك
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxD4TKJxRdjuP9cTaFH18l4dQ5H2bmVCo3lu_JjPVAyEnZqorF9tX7hC-DoKh2fBG04/exec';

export default function ManagePage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  
  // Form fields
  const [stage, setStage] = useState('prep');
  const [grade, setGrade] = useState(0);
  const [subject, setSubject] = useState('الجبر');
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');

  const subjects: Record<string, string[][]> = {
    prep: [['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'حساب المثلثات']],
    secondary: [['الجبر', 'الهندسة', 'حساب المثلثات'], ['الجبر', 'التفاضل والتكامل', 'حساب المثلثات'], ['الجبر', 'الهندسة الفراغية', 'التفاضل والتكامل', 'الاستاتيكا', 'الديناميكا']]
  };

  // تحميل الفيديوهات من Google Sheets
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
      setMsg('⚠️ خطأ في تحميل الفيديوهات');
    }
  };

  const handleLogin = () => {
    if (password === 'engmagdi2025') {
      setIsAuth(true);
      setMsg('');
    } else {
      setMsg('❌ كلمة المرور غلط');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const branchId = `${stage}-${grade}-${subject}`;
    const newVideo = {
      id: Date.now().toString(),
      branch_id: branchId,
      video_id: videoId,
      title,
      duration
    };

    try {
      // ⚠️ مهم: نستخدم no-cors عشان نتجنب مشاكل CORS مع Google Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      });
      
      // نضيف الفيديو للقائمة فوراً عشان يظهر للمستخدم
      setVideos([newVideo, ...videos]);
      setMsg('✅ تم الحفظ في Google Sheets بنجاح!');
      setVideoId('');
      setTitle('');
      setDuration('');
    } catch (error) {
      console.error('Error saving video:', error);
      setMsg('❌ خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', direction: 'rtl' }}>
        <div style={{ background: '#1e293b', padding: 40, borderRadius: 20 }}>
          <h2>🔐 دخول الأدمن</h2>
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: 14, borderRadius: 12, marginBottom: 16, color: 'black' }}
          />
          <button onClick={handleLogin} style={{ width: '100%', padding: 14, background: '#2563eb', color: 'white', border: 'none', borderRadius: 12 }}>دخول</button>
          {msg && <p style={{ marginTop: 12, color: msg.includes('❌') ? '#ef4444' : '#10b981' }}>{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 40, direction: 'rtl' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1>🎬 إدارة الفيديوهات</h1>
        
        {/* Form الإضافة */}
        <form onSubmit={handleSave} style={{ background: 'white', padding: 24, borderRadius: 20, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>المرحلة</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setStage('prep'); setGrade(0); setSubject(subjects.prep[0][0]); }} 
                style={{ flex: 1, padding: 12, borderRadius: 10, border: stage === 'prep' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'prep' ? '#eff6ff' : 'white' }}>
                الإعدادية
              </button>
              <button type="button" onClick={() => { setStage('secondary'); setGrade(0); setSubject(subjects.secondary[0][0]); }} 
                style={{ flex: 1, padding: 12, borderRadius: 10, border: stage === 'secondary' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'secondary' ? '#eff6ff' : 'white' }}>
                الثانوية
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>الصف</label>
            <select value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setSubject(subjects[stage][Number(e.target.value)][0]); }} 
              style={{ width: '100%', padding: 12, borderRadius: 10 }}>
              {['الأول', 'الثاني', 'الثالث'].map((g, i) => <option key={i} value={i}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>المادة</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} 
              style={{ width: '100%', padding: 12, borderRadius: 10 }}>
              {subjects[stage][grade].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Video ID من يوتيوب</label>
            <input type="text" placeholder="94RTbe5stok" value={videoId} onChange={(e) => setVideoId(e.target.value)} required 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>عنوان الفيديو</label>
            <input type="text" placeholder="الدرس الأول - القسمة المطولة" value={title} onChange={(e) => setTitle(e.target.value)} required 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>المدة (اختياري)</label>
            <input type="text" placeholder="15:30" value={duration} onChange={(e) => setDuration(e.target.value)} 
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
          </div>

          <button type="submit" disabled={loading} 
            style={{ width: '100%', padding: 16, borderRadius: 12, background: loading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', fontSize: 16 }}>
            {loading ? 'جاري الحفظ...' : '💾 حفظ الفيديو'}
          </button>

          {msg && <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', textAlign: 'center' }}>{msg}</div>}
        </form>

        {/* عرض الفيديوهات */}
        <div style={{ background: 'white', padding: 24, borderRadius: 20 }}>
          <h3>الفيديوهات المحفوظة ({videos.length})</h3>
          {videos.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>مفيش فيديوهات لسه</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {videos.map((v) => (
                <div key={v.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{v.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {v.branch_id} | Video ID: {v.video_id} {v.duration && `| ${v.duration}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}