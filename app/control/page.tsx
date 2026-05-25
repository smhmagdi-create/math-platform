'use client';
import { useState, useEffect } from 'react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJQOWbtufjDTEmwwc55B4cz_SkMLU4gD48QL770YgJmhDeuht1fLJp8qt4eINACE7M/exec';

export default function ControlPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  
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

  // تحميل الفيديوهات لعرضها في القائمة
  const loadVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const url = `${GOOGLE_SCRIPT_URL}?t=${Date.now()}`;
      const response = await fetch(url);
      const data = await response.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (isAuth) loadVideos();
  }, [isAuth]);

  // تسجيل الدخول للأدمن
  const handleLogin = () => {
    if (password === 'engmagdi2025') {
      setIsAuth(true);
      setMsg('');
    } else {
      setMsg('❌ كلمة المرور غلط');
    }
  };

  // حفظ فيديو جديد في Google Sheets
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
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      });
      
      // إضافة الفيديو للقائمة فوراً
      setVideos([newVideo, ...videos]);
      setMsg('✅ تم الحفظ في Google Sheets بنجاح!');
      
      // إعادة التحميل للتأكد
      setTimeout(() => loadVideos(), 2000);
      
      // تفريغ الحقول
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

  // === صفحة الدخول ===
  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ background: 'white', padding: 40, borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '90%', maxWidth: 400 }}>
          <h2 style={{ marginBottom: 24, textAlign: 'center', color: '#1e293b' }}>🔐 دخول الأدمن</h2>
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: 14, borderRadius: 10, marginBottom: 16, border: '2px solid #e2e8f0', fontSize: 16 }}
          />
          <button onClick={handleLogin} style={{ width: '100%', padding: 14, background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>دخول</button>
          {msg && <p style={{ marginTop: 12, color: msg.includes('❌') ? '#ef4444' : '#10b981', textAlign: 'center', fontWeight: 600 }}>{msg}</p>}
        </div>
      </div>
    );
  }

  // === لوحة التحكم ===
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 40, direction: 'rtl' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#1e293b' }}>🎬 إدارة الفيديوهات</h1>
          <button onClick={() => setIsAuth(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🚪 خروج</button>
        </div>
        
        {/* فورم إضافة فيديو */}
        <form onSubmit={handleSave} style={{ background: 'white', padding: 24, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 20, color: '#1e293b' }}>➕ إضافة فيديو جديد</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>المرحلة</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setStage('prep'); setGrade(0); }} 
                style={{ flex: 1, padding: 12, borderRadius: 8, border: stage === 'prep' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'prep' ? '#eff6ff' : 'white', cursor: 'pointer', fontWeight: stage === 'prep' ? 700 : 400 }}>
                الإعدادية
              </button>
              <button type="button" onClick={() => { setStage('secondary'); setGrade(0); }} 
                style={{ flex: 1, padding: 12, borderRadius: 8, border: stage === 'secondary' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'secondary' ? '#eff6ff' : 'white', cursor: 'pointer', fontWeight: stage === 'secondary' ? 700 : 400 }}>
                الثانوية
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>الصف</label>
            <select value={grade} onChange={(e) => setGrade(Number(e.target.value))} 
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }}>
              <option value={0}>الأول</option>
              <option value={1}>الثاني</option>
              <option value={2}>الثالث</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>المادة</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} 
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }}>
              {subjects[stage][grade].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Video ID من يوتيوب</label>
            <input type="text" placeholder="مثال: 94RTbe5stok" value={videoId} onChange={(e) => setVideoId(e.target.value)} required 
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>عنوان الفيديو</label>
            <input type="text" placeholder="مثال: الدرس الأول - القسمة المطولة" value={title} onChange={(e) => setTitle(e.target.value)} required 
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>المدة (اختياري)</label>
            <input type="text" placeholder="مثال: 15:30" value={duration} onChange={(e) => setDuration(e.target.value)} 
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }} />
          </div>

          <button type="submit" disabled={loading} 
            style={{ width: '100%', padding: 16, borderRadius: 10, background: loading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'جاري الحفظ...' : '💾 حفظ الفيديو'}
          </button>

          {msg && <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', textAlign: 'center', fontWeight: 600 }}>{msg}</div>}
        </form>

        {/* عرض الفيديوهات الموجودة */}
        <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>الفيديوهات المحفوظة ({videos.length})</h3>
            <button onClick={loadVideos} style={{ padding: '6px 12px', background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>🔄 تحديث</button>
          </div>
          
          {isLoadingVideos ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ جاري التحميل...</p>
          ) : videos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>📭 مفيش فيديوهات لسه</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
              {videos.map((v, index) => (
                <div key={v.id || index} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>{v.title}</div>
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