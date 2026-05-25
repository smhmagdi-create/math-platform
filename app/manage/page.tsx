'use client';
import { useState } from 'react';

export default function ManagePage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [videos, setVideos] = useState<any[]>([]);

  // تحميل الفيديوهات المحفوظة
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_videos');
      if (saved) setVideos(JSON.parse(saved));
    }
  }, []);

  const handleLogin = () => {
    if (password === 'engmagdi2025') {
      setIsAuth(true);
    } else {
      setMsg('❌ كلمة المرور غلط');
    }
  };

  const handleSave = () => {
    const newVideo = { id: Date.now(), title: 'فيديو تجريبي' };
    const updated = [newVideo, ...videos];
    localStorage.setItem('my_videos', JSON.stringify(updated));
    setVideos(updated);
    setMsg('✅ تم الحفظ بنجاح (محلياً)!');
  };

  if (!isAuth) {
    return (
      <div style={{ padding: 50, textAlign: 'center', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
        <h1>🔐 دخول الأدمن</h1>
        <input 
          type="password" 
          placeholder="كلمة المرور" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, marginBottom: 10, display: 'block', margin: '10px auto', color: 'black' }}
        />
        <button onClick={handleLogin} style={{ padding: 10, background: 'blue', color: 'white', border: 'none' }}>دخول</button>
        <p>{msg}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 50, background: '#f8fafc', minHeight: '100vh' }}>
      <h1> إدارة الفيديوهات</h1>
      <button onClick={handleSave} style={{ padding: 15, background: 'green', color: 'white', border: 'none', fontSize: 18 }}>
        💾 احفظ فيديو تجريبي
      </button>
      <p style={{ color: 'green', fontWeight: 'bold' }}>{msg}</p>
      
      <div style={{ marginTop: 20 }}>
        <h3>الفيديوهات المحفوظة ({videos.length})</h3>
        {videos.map(v => (
          <div key={v.id} style={{ padding: 10, background: 'white', marginBottom: 5, border: '1px solid #ddd' }}>
            {v.title}
          </div>
        ))}
      </div>
    </div>
  );
}