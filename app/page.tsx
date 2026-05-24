'use client';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ==================== TYPES ====================
type Stage = 'home' | 'prep' | 'secondary';
type SelectedLevel = { stage: 'prep' | 'secondary'; index: number } | null;
type Video = { id: string; title: string; duration: string };
type ToastType = 'success' | 'error' | 'info' | null;

// ==================== COMPONENTS ====================
function AnimatedCounter({ value, title, icon }: { value: number; title: string; icon: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.max(Math.floor(duration / value), 15);
    const timer = setInterval(() => {
      start += Math.ceil(value / 100);
      if (start >= value) { setCount(value); clearInterval(timer); }
      else { setCount(start); }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: '1.4rem' }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#facc15', lineHeight: 1 }}>+{count}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.9, marginTop: 2 }}>{title}</div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: bg, color: 'white',
        padding: '12px 24px', borderRadius: 12, fontWeight: 700, zIndex: 10000, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        textAlign: 'center', maxWidth: '90%', fontSize: '0.95rem' }}>
      {message}
    </motion.div>
  );
}

// ==================== MAIN PAGE ====================
export default function Home() {
  const [isAuth, setIsAuth] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>('home');
  const [selectedLevel, setSelectedLevel] = useState<SelectedLevel>(null);
  const [userName, setUserName] = useState('');
  const [motivationalMsg, setMotivationalMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'branches' | 'videos'>('branches');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [images] = useState<string[]>(['/slide-1.png', '/slide-2.png', '/slide-3.png']);
  const [currentImg, setCurrentImg] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: Exclude<ToastType, null> } | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Record<string, boolean>>({});
  const [viewLoading, setViewLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioUnlocked = useRef(false);
  const messages = ['🔥 استمر.. أنت أقرب للنجاح مما تتخيل', '💪 كل خطوة بتاخدها بتفرق في مستقبلك', '🚀 النجاح بيبدأ بقرارك النهارده', '📚 كمّل.. أنت بتبني نفسك بنفسك', '✨ المذاكرة دلوقتي = راحة في المستقبل'];
  const branchVideos: Record<string, Video[]> = {
    'prep-0-الجبر': [{ id: '94RTbe5stok', title: 'الدرس الأول القسمة المطولة', duration: '15:30' }],
    'prep-0-الهندسة': [], 'prep-0-الإحصاء': [], 'prep-1-الجبر': [], 'prep-1-الهندسة': [], 'prep-1-الإحصاء': [],
    'prep-2-الجبر': [], 'prep-2-الهندسة': [], 'prep-2-حساب المثلثات': [], 'secondary-0-الجبر': [],
    'secondary-0-الهندسة': [], 'secondary-0-حساب المثلثات': [], 'secondary-1-الجبر': [],
    'secondary-1-التفاضل والتكامل': [], 'secondary-1-حساب المثلثات': [], 'secondary-2-الجبر': [],
    'secondary-2-الهندسة الفراغية': [], 'secondary-2-التفاضل والتكامل': [], 'secondary-2-الاستاتيكا': [],
    'secondary-2-الديناميكا': [],
  };

  const showToast = (msg: string, type: Exclude<ToastType, null>) => setToast({ msg, type });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const savedToken = localStorage.getItem('token');
    const savedName = localStorage.getItem('userName');
    const savedWatched = localStorage.getItem('watchedVideos');
    if (savedWatched) setWatchedVideos(JSON.parse(savedWatched));
    if (savedToken) { setIsAuth(true); if (savedName) setUserName(savedName); }

    if (typeof window !== 'undefined') {
      const audio = new Audio('/click.mp3');
      audio.volume = 0.4; audio.preload = 'auto'; audio.load();
      audioRef.current = audio;
      const unlock = () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => { if (audioRef.current) audioRef.current.currentTime = 0; isAudioUnlocked.current = true; window.removeEventListener('click', unlock); window.removeEventListener('touchstart', unlock); }).catch(() => {});
        }
      };
      window.addEventListener('click', unlock); window.addEventListener('touchstart', unlock);
    }
  }, []);

  useEffect(() => { if (images.length === 0) return; const interval = setInterval(() => setCurrentImg((prev) => (prev + 1) % images.length), 4000); return () => clearInterval(interval); }, [images]);
  
  const playClickSound = useCallback(() => {
    if (audioRef.current) {
      if (!isAudioUnlocked.current) { audioRef.current.play().then(() => { isAudioUnlocked.current = true; }).catch(() => {}); }
      audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggleWatched = (videoId: string) => {
    const updated = { ...watchedVideos, [videoId]: !watchedVideos[videoId] };
    setWatchedVideos(updated);
    localStorage.setItem('watchedVideos', JSON.stringify(updated));
    showToast(updated[videoId] ? '✅ تم تحديد الفيديو كمكتمل' : '↩️ تم إلغاء التحديد', 'info');
  };

  const handleViewChange = (mode: 'branches' | 'videos') => {
    setViewLoading(true);
    setTimeout(() => { setViewMode(mode); setViewLoading(false); }, 200);
  };

  const checkCode = async () => {
    playClickSound();
    if (!code.trim()) { showToast('من فضلك أدخل كود الاشتراك', 'error'); return; }
    setLoading(true);
    try {
      let deviceId = localStorage.getItem('deviceId') || crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', deviceId);
      const res = await fetch('https://sheetdb.io/api/v1/w28940080r92q/search?code=' + encodeURIComponent(code));
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) { showToast('❌ الكود غير صحيح أو منتهي الصلاحية', 'error'); setLoading(false); return; }
      
      const user = data[0];
      setUserName(user.name || 'طالب');
      localStorage.setItem('userName', user.name || 'طالب');
      setMotivationalMsg(messages[Math.floor(Math.random() * messages.length)]);

      if (!user.deviceId) {
        await fetch('https://sheetdb.io/api/v1/w28940080r92q/code/' + encodeURIComponent(code), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { deviceId } }) });
      } else if (user.deviceId !== deviceId) {
        showToast('❌ هذا الكود مستخدم على جهاز آخر', 'error'); setLoading(false); return;
      }
      localStorage.setItem('token', code); setIsAuth(true); showToast('🎉 تم تسجيل الدخول بنجاح', 'success');
    } catch { showToast('⚠️ حدث خطأ في الاتصال بالخادم', 'error'); }
    finally { setLoading(false); }
  };

  const logout = () => {
    playClickSound();
    localStorage.removeItem('token'); localStorage.removeItem('userName');
    setIsAuth(false); setCode(''); setStage('home'); setSelectedLevel(null);
    setViewMode('branches'); setSelectedBranch(null); setPlayingVideo(null);
    setUserName(''); setMotivationalMsg(''); setSearchQuery('');
    showToast('👋 تم تسجيل الخروج', 'info');
  };

  const prepYears = [{ title: 'الصف الأول الإعدادي', icon: '📘', msg: 'ابدأ تأسيسك الصح من هنا 💪' }, { title: 'الصف الثاني الإعدادي', icon: '📗', msg: 'خطوة جديدة نحو التفوق 🔥' }, { title: 'الصف الثالث الإعدادي', icon: '📕', msg: 'استعد للثانوي بقوة 🚀' }];
  const secondaryYears = [{ title: 'الصف الأول الثانوي', icon: '🧪', msg: 'ابدأ رحلة الاحتراف ✨' }, { title: 'الصف الثاني الثانوي', icon: '📐', msg: 'أنت قريب من القمة 🔥' }, { title: 'الصف الثالث الثانوي', icon: '🎓', msg: 'طريقك للنجاح يبدأ هنا 💥' }];
  const branches = {
    prep: [[{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'الإحصاء', icon: '📊' }], [{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'الإحصاء', icon: '📊' }], [{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'حساب المثلثات', icon: '📈' }]],
    secondary: [[{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'حساب المثلثات', icon: '📈' }], [{ name: 'الجبر', icon: '➗' }, { name: 'التفاضل والتكامل', icon: '∫' }, { name: 'حساب المثلثات', icon: '📈' }], [{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة الفراغية', icon: '📦' }, { name: 'التفاضل والتكامل', icon: '∫' }, { name: 'الاستاتيكا', icon: '⚖️' }, { name: 'الديناميكا', icon: '🏎️' }]],
  };

  const cardVariants: Variants = { hover: { scale: 1.04, y: -10, boxShadow: '0 25px 40px rgba(0,0,0,0.2)', transition: { type: 'spring', stiffness: 300, damping: 18 } } };
  const buttonVariants: Variants = { hover: { scale: 1.04, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }, tap: { scale: 0.98 } };
  const filteredPrepYears = useMemo(() => prepYears.filter(y => y.title.includes(searchQuery)), [searchQuery]);
  const filteredSecondaryYears = useMemo(() => secondaryYears.filter(y => y.title.includes(searchQuery)), [searchQuery]);

  const renderVideos = () => {
    if (!selectedBranch || viewMode !== 'videos') return null;
    const videos = branchVideos[selectedBranch] || [];
    const branchName = selectedBranch.split('-').pop() || '';
    return (
      <motion.div key="videos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
        <div style={styles.controlsRow}>
          <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" style={styles.backBtn} onClick={() => { playClickSound(); handleViewChange('branches'); setSelectedBranch(null); setPlayingVideo(null); }}>⬅ رجوع للفروع</motion.button>
        </div>
        <h2 style={styles.sectionTitle}>فيديوهات {branchName}</h2>
        {viewLoading ? (
          <div style={{ display: 'grid', gap: 24, maxWidth: 900, margin: '0 auto', padding: '0 24px 40px 24px' }}>
            {[1, 2].map(i => <div key={i} style={{ height: 250, borderRadius: 20, background: darkMode ? '#1e293b' : '#f1f5f9', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : videos.length > 0 ? (
          <div style={{ display: 'grid', gap: 24, maxWidth: 900, margin: '0 auto', padding: '0 24px 40px 24px' }}>
            {videos.map((video) => (
              <motion.div key={video.id} variants={cardVariants} whileHover="hover" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 20, overflow: 'hidden', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.1)', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                {!playingVideo || playingVideo.id !== video.id ? (
                  <div onClick={() => { playClickSound(); setPlayingVideo(video); }} style={{ position: 'relative', cursor: 'pointer' }}>
                    <img src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} alt={video.title} style={{ width: '100%', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(250, 204, 21, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>▶</div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700 }}>{video.duration}</div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, borderRadius: 16 }} />
                  </div>
                )}
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: darkMode ? '#f8fafc' : '#0f172a' }}>{video.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                    {watchedVideos[video.id] && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>✅ تمت المشاهدة</span>}
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => toggleWatched(video.id)} style={{ background: watchedVideos[video.id] ? '#334155' : '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>{watchedVideos[video.id] ? 'إلغاء التحديد' : 'تحديد كمكتمل'}</motion.button>
                    {playingVideo?.id === video.id && <motion.button whileHover={{ scale: 1.05 }} onClick={() => { playClickSound(); setPlayingVideo(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>✕ إغلاق</motion.button>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.7 }}>
            <div style={{ fontSize: '5rem', marginBottom: 20 }}>🚧</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 12 }}>جاري تحضير محتوى {branchName}</h3>
            <p>سيتم إضافة الفيديوهات قريباً إن شاء الله</p>
          </div>
        )}
      </motion.div>
    );
  };

  const renderBranches = () => {
    if (!selectedLevel) return null;
    const list = selectedLevel.stage === 'prep' ? branches.prep[selectedLevel.index] : branches.secondary[selectedLevel.index];
    const filteredBranches = list.filter(b => b.name.includes(searchQuery));
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
        <div style={styles.controlsRow}>
          <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" style={styles.backBtn} onClick={() => { playClickSound(); setSelectedLevel(null); setSearchQuery(''); }}>⬅ رجوع للفصول</motion.button>
          <input type="text" placeholder="🔍 ابحث عن فرع معين..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...styles.searchBar, background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', borderColor: darkMode ? '#334155' : '#cbd5e1' }} />
        </div>
        <h2 style={styles.sectionTitle}>فروع الرياضيات</h2>
        <div style={styles.grid}>
          {filteredBranches.map((b, i) => {
            const branchKey = `${selectedLevel?.stage}-${selectedLevel?.index}-${b.name}`;
            const hasVideos = (branchVideos[branchKey] || []).length > 0;
            const watchedCount = branchVideos[branchKey]?.filter(v => watchedVideos[v.id]).length || 0;
            const totalVideos = branchVideos[branchKey]?.length || 0;
            return (
              <motion.div key={i} variants={cardVariants} whileHover="hover" onClick={() => { playClickSound(); setSelectedBranch(branchKey); handleViewChange('videos'); }} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 10px 25px rgba(0,0,0,0.3), 0 0 1px rgba(250,204,21,0.1)' : '0 10px 25px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
                <div style={styles.icon}>{b.icon}</div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 12, margin: 0 }}>{b.name}</h3>
                {totalVideos > 0 && <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}> <div style={{ height: '100%', background: '#10b981', width: `${(watchedCount / totalVideos) * 100}%`, borderRadius: 4, transition: 'width 0.3s' }} /> </div>}
                <div style={{ ...styles.enterBtn, background: hasVideos ? '#facc15' : '#94a3b8', color: hasVideos ? '#0f172a' : 'white' }}>{hasVideos ? `مشاهدة الفيديوهات (${watchedCount}/${totalVideos}) ←` : 'قريباً 🔜'}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ ...styles.app, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#0f172a' }}>
      {/* Responsive CSS Injection */}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @media (max-width: 768px) { .banner { height: 200px !important; } .grid-container { grid-template-columns: 1fr !important; gap: 16px !important; padding: 12px !important; } .nav-container { padding: 12px 16px !important; } .title-xl { font-size: 24px !important; } .controls-row { flex-direction: column-reverse !important; gap: 10px !important; } }`}</style>
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />} </AnimatePresence>
      {darkMode && <div style={{ position: 'fixed', top: -150, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'rgba(250, 204, 21, 0.06)', filter: 'blur(150px)', pointerEvents: 'none', zIndex: 0 }} />}
      
      <AnimatePresence>{!isAuth && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.loginOverlay}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', stiffness: 260, damping: 25 }} style={{ ...styles.loginBox, background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(250,204,21,0.05)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={styles.loginTitle}>🔐 ادخل كود الاشتراك</h2>
            {loading ? (
              <div style={styles.skeletonContainer}>
                <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.2 }} style={styles.skeletonPulse} />
                <p style={{ fontWeight: 700, marginTop: 12 }}>جاري فحص الكود وتأمين الجهاز...</p>
              </div>
            ) : (
              <>
                <input type="password" placeholder="أدخل كودك السري هنا" value={code} onChange={(e) => setCode(e.target.value)} style={{ ...styles.input, background: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', borderColor: darkMode ? '#334155' : '#cbd5e1' }} />
                <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={checkCode} style={styles.button}>دخول المنصة الآمنة</motion.button>
                <motion.a variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={playClickSound} href="https://wa.me/201015134800" target="_blank" rel="noopener noreferrer" style={styles.supportBtn}>📞 التواصل مع الدعم الفني</motion.a>
              </>
            )}
          </motion.div>
        </motion.div>
      )} </AnimatePresence>

      <nav className="nav-container" style={{ ...styles.nav, background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)' }}>
        {isAuth && (
          <div style={styles.userBox}>
            <div style={styles.userWelcome}>👋 أهلاً يا باشمهندس</div>
            <div style={{ ...styles.userName, color: darkMode ? '#facc15' : '#2563eb' }}>{userName || 'جاري التحميل...'}</div>
            <motion.button variants={buttonVariants} whileHover={{ scale: 1.05, background: '#dc2626' }} whileTap="tap" onClick={logout} style={styles.logoutBtn}>تسجيل خروج</motion.button>
          </div>
        )}
        <div onClick={() => { playClickSound(); setDarkMode(!darkMode); }} style={{ ...styles.themeToggle, background: darkMode ? '#2563eb' : '#e2e8f0', display: 'flex', justifyContent: darkMode ? 'flex-end' : 'flex-start', alignItems: 'center' }}>
          <span style={{ position: 'absolute', right: 8, fontSize: 12, display: darkMode ? 'none' : 'block' }}>☀️</span>
          <span style={{ position: 'absolute', left: 8, fontSize: 12, display: darkMode ? 'block' : 'none' }}>🌙</span>
          <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={{ width: 24, height: 24, borderRadius: '50%', background: '#ffffff', zIndex: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
        </div>
      </nav>

      <header className="banner" style={styles.banner}>
        <div style={styles.sliderWrapper}>
          {images.map((img, index) => <img key={index} src={img} alt="banner" style={{ ...styles.bannerImg, opacity: currentImg === index ? 1 : 0 }} />)}
          <div style={styles.bannerOverlay} />
        </div>
      </header>

      <div style={styles.dotsContainer}>
        {images.map((_, index) => <div key={index} onClick={() => { playClickSound(); setCurrentImg(index); }} style={{ ...styles.dot, width: currentImg === index ? 24 : 8, background: currentImg === index ? (darkMode ? '#facc15' : '#2563eb') : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)') }} />)}
      </div>

      <AnimatePresence>{isAuth && motivationalMsg && <motion.div initial={{ scale: 0.9, opacity: 0, y: -10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: -10 }} style={styles.motivationBox}>{motivationalMsg}</motion.div>} </AnimatePresence>

      {isAuth && stage === 'home' && <div style={styles.statsHorizontalBar}> <AnimatedCounter value={7500} title="طلاب مستمر" icon="🧑‍🎓" /> <AnimatedCounter value={350} title="ساعة تأسيس" icon="⏳" /> <AnimatedCounter value={120} title="إمتحان شامل" icon="📝" /> </div>}

      <AnimatePresence mode="wait">
        {stage === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid-container" style={styles.stageContainer}>
            <motion.div variants={cardVariants} whileHover="hover" style={{ ...styles.bigCard, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '2px solid #2563eb' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 15px 35px rgba(0,0,0,0.3)' : '0 15px 35px rgba(0,0,0,0.03)' }} onClick={() => { playClickSound(); setStage('prep'); }}>
              <div style={styles.bigIcon}>🏫</div> <h2 className="title-xl" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '15px 0' }}>المرحلة الإعدادية</h2> <div style={styles.enterBtn}>دخول وجدول الحصص ←</div>
            </motion.div>
            <motion.div variants={cardVariants} whileHover="hover" style={{ ...styles.bigCard, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '2px solid #16a34a' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 15px 35px rgba(0,0,0,0.3)' : '0 15px 35px rgba(0,0,0,0.03)' }} onClick={() => { playClickSound(); setStage('secondary'); }}>
              <div style={styles.bigIcon}>🎓</div> <h2 className="title-xl" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '15px 0' }}>المرحلة الثانوية</h2> <div style={styles.enterBtn}>دخول وجدول الحصص ←</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'prep' && !selectedLevel && (
          <motion.div key="prep" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="controls-row" style={styles.controlsRow}>
              <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" style={styles.backBtn} onClick={() => { playClickSound(); setStage('home'); setSearchQuery(''); }}>⬅ رجوع للرئيسية</motion.button>
              <input type="text" placeholder="🔍 ابحث عن صفك الدراسي..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...styles.searchBar, background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', borderColor: darkMode ? '#334155' : '#cbd5e1' }} />
            </div>
            <h2 className="title-xl" style={styles.sectionTitle}>المرحلة الإعدادية</h2>
            <div className="grid-container" style={styles.grid}>
              {filteredPrepYears.map((year, index) => {
                const originalIndex = prepYears.findIndex(p => p.title === year.title);
                return ( <motion.div key={index} variants={cardVariants} whileHover="hover" onClick={() => { playClickSound(); setSelectedLevel({ stage: 'prep', index: originalIndex }); setSearchQuery(''); }} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> <div style={styles.icon}>{year.icon}</div> <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 5px 0' }}>{year.title}</h3> <p style={styles.msg}>{year.msg}</p> <div style={styles.enterBtn}>عرض الفروع ←</div> </motion.div>);
              })}
            </div>
          </motion.div>
        )}
        {stage === 'secondary' && !selectedLevel && (
          <motion.div key="secondary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="controls-row" style={styles.controlsRow}>
              <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" style={styles.backBtn} onClick={() => { playClickSound(); setStage('home'); setSearchQuery(''); }}>⬅ رجوع للرئيسية</motion.button>
              <input type="text" placeholder="🔍 ابحث عن صفك الدراسي..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...styles.searchBar, background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', borderColor: darkMode ? '#334155' : '#cbd5e1' }} />
            </div>
            <h2 className="title-xl" style={styles.sectionTitle}>المرحلة الثانوية</h2>
            <div className="grid-container" style={styles.grid}>
              {filteredSecondaryYears.map((year, index) => {
                const originalIndex = secondaryYears.findIndex(s => s.title === year.title);
                return ( <motion.div key={index} variants={cardVariants} whileHover="hover" onClick={() => { playClickSound(); setSelectedLevel({ stage: 'secondary', index: originalIndex }); setSearchQuery(''); }} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> <div style={styles.icon}>{year.icon}</div> <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 5px 0' }}>{year.title}</h3> <p style={styles.msg}>{year.msg}</p> <div style={styles.enterBtn}>عرض الفروع ←</div> </motion.div>);
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {viewMode === 'videos' && selectedBranch && renderVideos()}
        {viewMode === 'branches' && renderBranches()}
      </AnimatePresence>

      <footer style={styles.footer}>كل الحقوق محفوظة © eng samehmagdi {new Date().getFullYear()}</footer>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: { fontFamily: "'Cairo','Poppins',sans-serif", direction: 'rtl', minHeight: '100vh', WebkitFontSmoothing: 'antialiased', transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflowX: 'hidden' },
  loginOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' },
  loginBox: { width: '90%', maxWidth: 400, padding: 40, borderRadius: 28, textAlign: 'center', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  loginTitle: { marginBottom: 26, fontSize: '1.6rem', fontWeight: 800 },
  input: { width: '100%', padding: '16px 18px', borderRadius: 14, border: '1px solid', fontSize: '1rem', outline: 'none', textAlign: 'center', letterSpacing: '2px', fontWeight: 700, transition: 'all 0.25s ease', boxSizing: 'border-box' },
  button: { width: '100%', padding: 16, borderRadius: 14, background: '#2563eb', color: 'white', border: 'none', marginTop: 18, cursor: 'pointer', fontSize: '1.05rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)', boxSizing: 'border-box' },
  supportBtn: { display: 'block', marginTop: 14, background: '#16a34a', color: 'white', padding: 14, borderRadius: 14, textDecoration: 'none', fontSize: '1.05rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)', boxSizing: 'border-box' },
  skeletonContainer: { padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  skeletonPulse: { width: 60, height: 60, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', position: 'sticky', top: 0, zIndex: 1000, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', transition: 'all 0.4s ease' },
  userBox: { display: 'flex', flexDirection: 'column', gap: 2 },
  userWelcome: { fontSize: 13, fontWeight: 600, opacity: 0.7 },
  userName: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' },
  themeToggle: { width: 68, height: 36, borderRadius: 999, position: 'relative', cursor: 'pointer', padding: 6, overflow: 'hidden', transition: 'background-color 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' },
  logoutBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', marginTop: 4, width: 'fit-content', boxShadow: '0 3px 8px rgba(239, 68, 68, 0.2)' },
  banner: { width: '100%', height: 340, overflow: 'hidden', position: 'relative' },
  sliderWrapper: { position: 'relative', width: '100%', height: '100%' },
  bannerImg: { position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 1s ease-in-out' },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(15,23,42,0.15) 100%)', pointerEvents: 'none' },
  dotsContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, margin: '12px 0 28px 0', zIndex: 95, position: 'relative' },
  dot: { height: 8, borderRadius: 4, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  statsHorizontalBar: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 12, maxWidth: 500, margin: '0 auto 35px auto', padding: '8px 16px', background: 'rgba(30, 41, 59, 0.95)', borderRadius: 50, boxShadow: '0 12px 30px rgba(0,0,0,0.3)', position: 'relative', zIndex: 90, border: '1px solid rgba(255,255,255,0.1)', width: '95%' },
  statCard: { display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap-reverse', gap: 16, maxWidth: 1200, margin: '20px auto 0 auto', padding: '0 24px' },
  searchBar: { padding: '12px 20px', borderRadius: 14, border: '1px solid', fontSize: '0.95rem', outline: 'none', width: '100%', maxWidth: 360, fontWeight: 600, transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', boxSizing: 'border-box' },
  stageContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, justifyContent: 'center', padding: '10px 24px 40px 24px', maxWidth: 1200, margin: '0 auto' },
  bigCard: { padding: 40, borderRadius: 28, textAlign: 'center', cursor: 'pointer', transition: 'background-color 0.3s, border-color 0.3s' },
  bigIcon: { fontSize: 54 },
  sectionTitle: { textAlign: 'center', fontSize: 34, fontWeight: 800, margin: '30px 0 15px 0', letterSpacing: '-0.01em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, padding: '24px', maxWidth: 1200, margin: '0 auto 40px auto' },
  card: { padding: 36, borderRadius: 28, textAlign: 'center', cursor: 'pointer', transition: 'background-color 0.3s, border-color 0.3s' },
  icon: { fontSize: 58, marginBottom: 10 },
  msg: { color: '#64748b', fontSize: '0.95rem', marginBottom: 18, fontWeight: 600 },
  enterBtn: { marginTop: 10, background: '#facc15', color: '#0f172a', padding: '11px 24px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', display: 'inline-block', boxShadow: '0 4px 12px rgba(250, 204, 21, 0.25)' },
  backBtn: { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 14, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' },
  footer: { textAlign: 'center', padding: 40, color: '#64748b', fontWeight: 700, fontSize: '0.95rem', borderTop: '1px solid rgba(100,116,139,0.08)' },
  motivationBox: { margin: '10px auto 24px auto', padding: '18px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: 18, textAlign: 'center', fontSize: '1.15rem', fontWeight: 700, maxWidth: 500, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)', width: '90%' },
};