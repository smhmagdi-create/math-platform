'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

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

  const subjects: Record<string, string[][]> = {
    prep: [['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'حساب المثلثات']],
    secondary: [['الجبر', 'الهندسة', 'حساب المثلثات'], ['الجبر', 'التفاضل والتكامل', 'حساب المثلثات'], ['الجبر', 'الهندسة الفراغية', 'التفاضل والتكامل', 'الاستاتيكا', 'الديناميكا']]
  };

  const ADMIN_PASS = 'engmagdi2025';

  const handleLogin = () => {
    if (password === ADMIN_PASS) {
      setIsAuth(true);
      setMsg({ type: 'success', text: '✅ تم الدخول بنجاح' });
    } else {
      setMsg({ type: 'error', text: '❌ كلمة المرور غير صحيحة' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const branchId = `${stage}-${grade}-${subject}`;
    const rowData = { branch_id: branchId, video_id: videoId, title, duration };

    try {
      const res = await fetch('https://sheetdb.io/api/v1/w28940080r92q', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rowData })
      });

      if (res.ok) {
        setMsg({ type: 'success', text: '✅ تم حفظ الفيديو بنجاح!' });
        setVideoId(''); setTitle(''); setDuration('');
      } else {
        setMsg({ type: 'error', text: '❌ حدث خطأ أثناء الحفظ' });
      }
    } catch {
      setMsg({ type: 'error', text: '❌ فشل الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
        <div style={{ background: '#1e293b', padding: 40, borderRadius: 20, width: '90%', maxWidth: 400, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: 20, fontSize: '1.5rem' }}>🔐 لوحة تحكم الفيديوهات</h2>
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: '#0f172a', color: 'white', marginBottom: 16, fontSize: 16, textAlign: 'center', outline: 'none' }} />
          <button onClick={handleLogin} style={{ width: '100%', padding: 14, borderRadius: 12, background: '#2563eb', color: 'white', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>دخول</button>
          {msg.text && <p style={{ marginTop: 12, color: msg.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 600 }}>{msg.text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: '20px 20px 100px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 30, fontSize: '1.8rem' }}>🎬 إضافة فيديو جديد</h1>
        
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>المرحلة</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setStage('prep'); setGrade(0); setSubject(subjects.prep[0][0]); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: stage === 'prep' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'prep' ? '#eff6ff' : 'white', fontWeight: 700, cursor: 'pointer' }}>الإعدادية</button>
              <button type="button" onClick={() => { setStage('secondary'); setGrade(0); setSubject(subjects.secondary[0][0]); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: stage === 'secondary' ? '2px solid #2563eb' : '1px solid #e2e8f0', background: stage === 'secondary' ? '#eff6ff' : 'white', fontWeight: 700, cursor: 'pointer' }}>الثانوية</button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>الصف الدراسي</label>
            <select value={grade} onChange={(e) => { setGrade(Number(e.target.value)); setSubject(subjects[stage][Number(e.target.value)][0]); }} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 16, background: 'white' }}>
              {['الأول', 'الثاني', 'الثالث'].map((g, i) => <option key={i} value={i}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>المادة</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 16, background: 'white' }}>
              {subjects[stage][grade].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>معرف يوتيوب (Video ID)</label>
            <input type="text" placeholder="مثال: 94RTbe5stok" value={videoId} onChange={(e) => setVideoId(e.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 16, outline: 'none' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>عنوان الفيديو</label>
            <input type="text" placeholder="مثال: الدرس الأول - القسمة المطولة" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 16, outline: 'none' }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>المدة (اختياري)</label>
            <input type="text" placeholder="مثال: 15:30" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 16, outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, borderRadius: 12, background: loading ? '#94a3b8' : '#10b981', color: 'white', border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {loading ? 'جاري الحفظ...' : '💾 حفظ الفيديو'}
          </button>

          {msg.text && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', color: msg.type === 'error' ? '#dc2626' : '#16a34a', textAlign: 'center', fontWeight: 700 }}>
              {msg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}