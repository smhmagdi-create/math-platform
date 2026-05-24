'use client';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ==================== TYPES ====================
type Stage = 'home' | 'prep' | 'secondary';
type SelectedLevel = { stage: 'prep' | 'secondary'; index: number } | null;
type Video = { id: string; title: string; duration: string };
type ToastType = 'success' | 'error' | 'info' | null;
type ActiveTab = 'home' | 'progress' | 'support';

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
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [viewLoading, setViewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [studentGrade, setStudentGrade] = useState<SelectedLevel>(null);
  
  // ✅ الفيديوهات هتجي من الشيت دلوقتي
  const [branchVideos, setBranchVideos] = useState<Record<string, Video[]>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioUnlocked = useRef(false);
  const messages = ['🔥 استمر.. أنت أقرب للنجاح مما تتخيل', '💪 كل خطوة بتاخدها بتفرق في مستقبلك', '🚀 النجاح بيبدأ بقرارك النهارده', '📚 كمّل.. أنت بتبني نفسك بنفسك', '✨ المذاكرة دلوقتي = راحة في المستقبل'];

  const prepYears = [{ title: 'الصف الأول الإعدادي', index: 0, icon: '📘', msg: 'ابدأ تأسيسك الصح من هنا 💪' }, { title: 'الصف الثاني الإعدادي', index: 1, icon: '📗', msg: 'خطوة جديدة نحو التفوق 🔥' }, { title: 'الصف الثالث الإعدادي', index: 2, icon: '📕', msg: 'استعد للثانوي بقوة 🚀' }];
  const secondaryYears = [{ title: 'الصف الأول الثانوي', index: 0, icon: '🧪', msg: 'ابدأ رحلة الاحتراف ✨' }, { title: 'الصف الثاني الثانوي', index: 1, icon: '📐', msg: 'أنت قريب من القمة 🔥' }, { title: 'الصف الثالث الثانوي', index: 2, icon: '🎓', msg: 'طريقك للنجاح يبدأ هنا 💥' }];
  
  const branches = {
    prep: [[{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'الإحصاء', icon: '📊' }], [{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'الإحصاء', icon: '📊' }], [{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'حساب المثلثات', icon: '📈' }]],
    secondary: [[{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة', icon: '📐' }, { name: 'حساب المثلثات', icon: '📈' }], [{ name: 'الجبر', icon: '➗' }, { name: 'التفاضل والتكامل', icon: '∫' }, { name: 'حساب المثلثات', icon: '📈' }], [{ name: 'الجبر', icon: '➗' }, { name: 'الهندسة الفراغية', icon: '📦' }, { name: 'التفاضل والتكامل', icon: '∫' }, { name: 'الاستاتيكا', icon: '⚖️' }, { name: 'الديناميكا', icon: '🏎️' }]],
  };

  const showToast = (msg: string, type: Exclude<ToastType, null>) => setToast({ msg, type });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    const savedToken = localStorage.getItem('token');
    const savedName = localStorage.getItem('userName');
    const savedWatched = localStorage.getItem('watchedVideos');
    const savedProgress = localStorage.getItem('videoProgress');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedGrade = localStorage.getItem('studentGrade');
    
    if (savedWatched) setWatchedVideos(JSON.parse(savedWatched));
    if (savedProgress) setVideoProgress(JSON.parse(savedProgress));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedGrade) setStudentGrade(JSON.parse(savedGrade));
    if (savedToken) { setIsAuth(true); if (savedName) setUserName(savedName); }

    if (typeof window !== 'undefined') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !savedDarkMode) {
        setDarkMode(true);
      }
      
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

  // ✅ جلب الفيديوهات من الشيت بعد تسجيل الدخول
  useEffect(() => {
    if (isAuth) {
      fetch('https://sheetdb.io/api/v1/w28940080r92q')
        .then(res => res.json())
        .then(data => {
          const grouped: Record<string, Video[]> = {};
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              if (item.branch_id && item.video_id) {
                if (!grouped[item.branch_id]) grouped[item.branch_id] = [];
                grouped[item.branch_id].push({
                  id: item.video_id,
                  title: item.title || 'فيديو بدون عنوان',
                  duration: item.duration || '00:00'
                });
              }
            });
          }
          setBranchVideos(grouped);
        })
        .catch(err => console.error('Error loading videos:', err));
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setMotivationalMsg(randomMsg);
      const timer = setTimeout(() => setMotivationalMsg(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [isAuth]);

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

  const saveVideoProgress = (videoId: string, currentTime: number) => {
    const updated = { ...videoProgress, [videoId]: currentTime };
    setVideoProgress(updated);
    localStorage.setItem('videoProgress', JSON.stringify(updated));
  };

  const handleViewChange = (mode: 'branches' | 'videos') => {
    setViewLoading(true);
    setTimeout(() => { setViewMode(mode); setViewLoading(false); }, 200);
  };

  const selectStudentGrade = (grade: SelectedLevel) => {
    setStudentGrade(grade);
    localStorage.setItem('studentGrade', JSON.stringify(grade));
    showToast('✅ تم تحديد سنتك الدراسية', 'success');
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
    localStorage.removeItem('studentGrade');
    setIsAuth(false); setCode(''); setStage('home'); setSelectedLevel(null);
    setViewMode('branches'); setSelectedBranch(null); setPlayingVideo(null);
    setUserName(''); setMotivationalMsg(''); setSearchQuery('');
    setActiveTab('home'); setStudentGrade(null);
    showToast('👋 تم تسجيل الخروج', 'info');
  };

  const cardVariants: Variants = { hover: { scale: 1.02, y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', transition: { type: 'spring', stiffness: 300, damping: 20 } } };
  const buttonVariants: Variants = { hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(37, 99, 235, 0.4)' }, tap: { scale: 0.98 } };
  const filteredPrepYears = useMemo(() => prepYears.filter(y => y.title.includes(searchQuery)), [searchQuery]);
  const filteredSecondaryYears = useMemo(() => secondaryYears.filter(y => y.title.includes(searchQuery)), [searchQuery]);

  const calculateStats = (grade: SelectedLevel | null) => {
    if (!grade) return { totalVideos: 0, watchedCount: 0, progressPercentage: 0, branchStats: {}, gradeName: '' };
    
    const yearBranches = grade.stage === 'prep' ? branches.prep[grade.index] : branches.secondary[grade.index];
    const gradeVideos: Video[] = [];
    
    yearBranches.forEach(branch => {
      const branchKey = `${grade.stage}-${grade.index}-${branch.name}`;
      if (branchVideos[branchKey]) {
        gradeVideos.push(...branchVideos[branchKey]);
      }
    });
    
    const totalVideos = gradeVideos.length;
    const watchedCount = gradeVideos.filter(v => watchedVideos[v.id]).length;
    const progressPercentage = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
    
    const branchStats: Record<string, { watched: number; total: number }> = {};
    yearBranches.forEach(branch => {
      const branchKey = `${grade.stage}-${grade.index}-${branch.name}`;
      const videos = branchVideos[branchKey] || [];
      if (videos.length > 0) {
        const branchWatched = videos.filter(v => watchedVideos[v.id]).length;
        branchStats[branch.name] = { watched: branchWatched, total: videos.length };
      }
    });

    const gradeName = grade.stage === 'prep' ? prepYears[grade.index].title : secondaryYears[grade.index].title;
    return { totalVideos, watchedCount, progressPercentage, branchStats, gradeName };
  };

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
            {videos.map((video) => {
              const progress = videoProgress[video.id] || 0;
              return (
              <motion.div key={video.id} variants={cardVariants} whileHover="hover" style={{ background: darkMode ? '#1e293b' : 'white', borderRadius: 20, overflow: 'hidden', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                {!playingVideo || playingVideo.id !== video.id ? (
                  <div onClick={() => { playClickSound(); setPlayingVideo(video); }} style={{ position: 'relative', cursor: 'pointer' }}>
                    <img src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`} alt={video.title} style={{ width: '100%', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#ef4444', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}>▶</div>
                    </div>
                    {progress > 0 && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.5)' }}>
                        <div style={{ width: `${(progress / 100) * 100}%`, height: '100%', background: '#10b981' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700 }}>{video.duration}</div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&start=${Math.floor(progress * 900 / 100)}`} 
                      title={video.title} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      style={{ position: 'absolute', top: 0, left: 0, borderRadius: 16 }}
                    />
                  </div>
                )}
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0', color: darkMode ? '#f8fafc' : '#0f172a' }}>{video.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                    {watchedVideos[video.id] && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>✅ تمت المشاهدة</span>}
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => toggleWatched(video.id)} style={{ background: watchedVideos[video.id] ? '#334155' : '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>{watchedVideos[video.id] ? 'إلغاء التحديد' : 'تحديد كمكتمل'}</motion.button>
                    {playingVideo?.id === video.id && <motion.button whileHover={{ scale: 1.05 }} onClick={() => { playClickSound(); setPlayingVideo(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>✕ إغلاق</motion.button>}
                  </div>
                </div>
              </motion.div>
            )})}
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
              <motion.div key={i} variants={cardVariants} whileHover="hover" onClick={() => { playClickSound(); setSelectedBranch(branchKey); handleViewChange('videos'); }} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 10px 25px rgba(0,0,0,0.2), 0 0 1px rgba(250,204,21,0.1)' : '0 10px 25px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
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

  const renderProgressPage = () => {
    if (!studentGrade) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', paddingBottom: '80px', textAlign: 'center' }}>
          <h2 style={styles.sectionTitle}>اختار سنتك الدراسية أولاً 🎓</h2>
          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 24 }}>عشان نشوف تقدمك في الفيديوهات الخاصة بسنتك</p>
          
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>المرحلة الإعدادية</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {prepYears.map((year) => (
              <motion.button
                key={year.index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectStudentGrade({ stage: 'prep', index: year.index })}
                style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', padding: 16, cursor: 'pointer', border: '2px solid transparent' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{year.icon}</div>
                <div style={{ fontWeight: 700 }}>{year.title}</div>
              </motion.button>
            ))}
          </div>
          
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>المرحلة الثانوية</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {secondaryYears.map((year) => (
              <motion.button
                key={year.index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectStudentGrade({ stage: 'secondary', index: year.index })}
                style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', padding: 16, cursor: 'pointer', border: '2px solid transparent' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{year.icon}</div>
                <div style={{ fontWeight: 700 }}>{year.title}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      );
    }

    const stats = calculateStats(studentGrade);
    
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', paddingBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ ...styles.sectionTitle, margin: 0 }}>تقدمك في {stats.gradeName} 📊</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => setStudentGrade(null)}
            style={{ ...styles.backBtn, padding: '8px 16px', fontSize: '0.9rem' }}
          >
            تغيير السنة
          </motion.button>
        </div>
        
        <div style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{stats.progressPercentage === 100 ? '🏆' : stats.progressPercentage >= 50 ? '💪' : '📚'}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>نسبة إنجازك</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#facc15', marginBottom: 16 }}>{stats.progressPercentage}%</div>
          <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #facc15)', width: `${stats.progressPercentage}%`, borderRadius: 6, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>خلصت {stats.watchedCount} من {stats.totalVideos} فيديو في {stats.gradeName}</p>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>تقدمك في كل فرع</h3>
        {Object.keys(stats.branchStats).length > 0 ? (
          Object.entries(stats.branchStats).map(([branchName, data]) => {
            const percentage = Math.round((data.watched / data.total) * 100);
            return (
              <div key={branchName} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', marginBottom: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>{branchName}</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{percentage}%</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: percentage === 100 ? '#10b981' : '#3b82f6', width: `${percentage}%`, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b', marginTop: 8, marginBottom: 0 }}>
                  {data.watched} من {data.total} فيديو
                </p>
              </div>
            );
          })
        ) : (
          <div style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎬</div>
            <p>لا توجد فيديوهات متاحة في {stats.gradeName} حالياً</p>
            <p style={{ fontSize: '0.9rem', color: darkMode ? '#94a3b8' : '#64748b', marginTop: 8 }}>سيتم إضافة محتوى جديد قريباً!</p>
          </div>
        )}

        <div style={{ ...styles.motivationBox, marginTop: 24 }}>
          {stats.progressPercentage === 100 ? '🎉 مبروك! خلصت كل فيديوهات سنتك!' : 
           stats.progressPercentage >= 75 ? '🔥 أنت قربت على النهاية! كمل!' :
           stats.progressPercentage >= 50 ? '💪 نص الطريق.. أنت عظيم!' :
           stats.progressPercentage >= 25 ? '📚 كمل.. أنت في الطريق الصح!' :
           '🚀 ابدأ رحلتك النهارده!'}
        </div>
      </motion.div>
    );
  };

  const renderSupportPage = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '24px', paddingBottom: '80px', textAlign: 'center' }}>
      <h2 style={styles.sectionTitle}>تواصل معانا 💬</h2>
      
      <div style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', marginBottom: 24 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>💬</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>دعم فني مباشر</h3>
        <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: 20, fontSize: '1.05rem' }}>فريقنا موجود لمساعدتك في أي وقت</p>
        <motion.a 
          href="https://wa.me/201015134800" 
          target="_blank" 
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#25D366',
            color: 'white',
            padding: '16px 40px',
            borderRadius: 16,
            textDecoration: 'none',
            fontSize: '1.2rem',
            fontWeight: 800,
            boxShadow: '0 8px 25px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          💬 تواصل واتساب
        </motion.a>
      </div>

      <div style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', marginBottom: 24 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>❓</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>الأسئلة الشائعة</h3>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <details style={{ marginBottom: 12, padding: 12, background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer' }}>إزاي أستخدم المنصة؟</summary>
            <p style={{ marginTop: 8, color: darkMode ? '#94a3b8' : '#64748b' }}>ادخل الكود اللي معاك، اختار مرحلتك، وابدأ تشوف الفيديوهات!</p>
          </details>
          <details style={{ marginBottom: 12, padding: 12, background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: 8 }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer' }}>الفيديوهات بتتسجل؟</summary>
            <p style={{ marginTop: 8, color: darkMode ? '#94a3b8' : '#64748b' }}>أيوة! المنصة بتسجل آخر مكان وقف عنده كل فيديو.</p>
          </details>
        </div>
      </div>
    </motion.div>
  );

  const getGradeDisplay = () => {
    if (!studentGrade) return null;
    const gradeName = studentGrade.stage === 'prep' ? prepYears[studentGrade.index].title : secondaryYears[studentGrade.index].title;
    return gradeName;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ ...styles.app, background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#f8fafc' : '#0f172a' }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @media (max-width: 768px) { .banner { height: 200px !important; } .grid-container { grid-template-columns: 1fr !important; gap: 16px !important; padding: 12px !important; } .nav-container { padding: 10px 16px !important; } .title-xl { font-size: 24px !important; } .controls-row { flex-direction: column-reverse !important; gap: 10px !important; } }`}</style>
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

      {/* Navbar */}
      <nav className="nav-container" style={{ ...styles.nav, background: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)' }}>
        {isAuth && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ ...styles.userName, color: darkMode ? '#facc15' : '#2563eb' }}>{userName || 'جاري التحميل...'}</div>
              {studentGrade && (
                <div style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 700,
                  color: '#10b981',
                  background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                  padding: '4px 14px',
                  borderRadius: 20,
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  📚 {getGradeDisplay()}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div onClick={() => { playClickSound(); setDarkMode(!darkMode); localStorage.setItem('darkMode', JSON.stringify(!darkMode)); }} style={{ ...styles.themeToggle, background: darkMode ? '#334155' : '#e2e8f0' }}>
                <span style={{ fontSize: '16px', position: 'absolute', right: '6px' }}>☀️</span>
                <span style={{ fontSize: '16px', position: 'absolute', left: '6px' }}>🌙</span>
                <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ width: 22, height: 22, borderRadius: '50%', background: darkMode ? '#facc15' : '#ffffff', position: 'absolute', left: darkMode ? '4px' : '34px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>

              <motion.button variants={buttonVariants} whileHover={{ scale: 1.05, background: '#ef4444', color: 'white' }} whileTap="tap" onClick={logout} style={styles.logoutBtn}>
                <span style={{ fontSize: 14 }}>🚪</span> خروج
              </motion.button>
            </div>
          </div>
        )}
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

      <AnimatePresence>
        {isAuth && motivationalMsg && (
          <motion.div initial={{ scale: 0.9, opacity: 0, y: -10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: -10 }} style={styles.motivationBox}>
            {motivationalMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {isAuth && stage === 'home' && activeTab === 'home' && <div style={styles.statsHorizontalBar}> <AnimatedCounter value={7500} title="طلاب مستمر" icon="🧑‍🎓" /> <AnimatedCounter value={350} title="ساعة تأسيس" icon="⏳" /> <AnimatedCounter value={120} title="إمتحان شامل" icon="📝" /> </div>}

      <AnimatePresence mode="wait">
        {activeTab === 'home' && stage === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid-container" style={styles.stageContainer}>
            <motion.div variants={cardVariants} whileHover="hover" style={{ ...styles.bigCard, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '2px solid #2563eb' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 15px 35px rgba(0,0,0,0.3)' : '0 15px 35px rgba(0,0,0,0.03)' }} onClick={() => { playClickSound(); setStage('prep'); }}>
              <div style={styles.bigIcon}>🏫</div> <h2 className="title-xl" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '15px 0' }}>المرحلة الإعدادية</h2> <div style={styles.enterBtn}>دخول وجدول الحصص ←</div>
            </motion.div>
            <motion.div variants={cardVariants} whileHover="hover" style={{ ...styles.bigCard, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '2px solid #16a34a' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 15px 35px rgba(0,0,0,0.3)' : '0 15px 35px rgba(0,0,0,0.03)' }} onClick={() => { playClickSound(); setStage('secondary'); }}>
              <div style={styles.bigIcon}>🎓</div> <h2 className="title-xl" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '15px 0' }}>المرحلة الثانوية</h2> <div style={styles.enterBtn}>دخول وجدول الحصص ←</div>
            </motion.div>
          </motion.div>
        )}
        {activeTab === 'progress' && renderProgressPage()}
        {activeTab === 'support' && renderSupportPage()}
        {activeTab === 'home' && stage === 'prep' && !selectedLevel && (
          <motion.div key="prep" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="controls-row" style={styles.controlsRow}>
              <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" style={styles.backBtn} onClick={() => { playClickSound(); setStage('home'); setSearchQuery(''); }}>⬅ رجوع للرئيسية</motion.button>
              <input type="text" placeholder="🔍 ابحث عن صفك الدراسي..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...styles.searchBar, background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', borderColor: darkMode ? '#334155' : '#cbd5e1' }} />
            </div>
            <h2 className="title-xl" style={styles.sectionTitle}>المرحلة الإعدادية</h2>
            <div className="grid-container" style={styles.grid}>
              {filteredPrepYears.map((year) => (
                <motion.div key={year.index} variants={cardVariants} whileHover="hover" onClick={() => { playClickSound(); setSelectedLevel({ stage: 'prep', index: year.index }); setSearchQuery(''); }} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> 
                  <div style={styles.icon}>{year.icon}</div> 
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 5px 0' }}>{year.title}</h3> 
                  <p style={styles.msg}>{year.msg}</p> 
                  <div style={styles.enterBtn}>عرض الفروع ←</div> 
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'home' && stage === 'secondary' && !selectedLevel && (
          <motion.div key="secondary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <div className="controls-row" style={styles.controlsRow}>
              <motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" style={styles.backBtn} onClick={() => { playClickSound(); setStage('home'); setSearchQuery(''); }}>⬅ رجوع للرئيسية</motion.button>
              <input type="text" placeholder="🔍 ابحث عن صفك الدراسي..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...styles.searchBar, background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#f8fafc' : '#0f172a', borderColor: darkMode ? '#334155' : '#cbd5e1' }} />
            </div>
            <h2 className="title-xl" style={styles.sectionTitle}>المرحلة الثانوية</h2>
            <div className="grid-container" style={styles.grid}>
              {filteredSecondaryYears.map((year) => (
                <motion.div key={year.index} variants={cardVariants} whileHover="hover" onClick={() => { playClickSound(); setSelectedLevel({ stage: 'secondary', index: year.index }); setSearchQuery(''); }} style={{ ...styles.card, background: darkMode ? '#1e293b' : 'white', color: darkMode ? '#f8fafc' : '#0f172a', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}> 
                  <div style={styles.icon}>{year.icon}</div> 
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '10px 0 5px 0' }}>{year.title}</h3> 
                  <p style={styles.msg}>{year.msg}</p> 
                  <div style={styles.enterBtn}>عرض الفروع ←</div> 
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {viewMode === 'videos' && selectedBranch && activeTab === 'home' && renderVideos()}
        {viewMode === 'branches' && activeTab === 'home' && renderBranches()}
      </AnimatePresence>

      {/* ✅ Bottom Navigation Bar - Icons Only & Smaller */}
      {isAuth && (
        <div style={{
          ...styles.bottomNav,
          background: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          padding: '8px 0 12px 0'
        }}>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { playClickSound(); setActiveTab('home'); setStage('home'); setSelectedLevel(null); setViewMode('branches'); setSelectedBranch(null); }}
            style={{ 
              ...styles.navButton, 
              background: activeTab === 'home' ? '#2563eb' : 'transparent', 
              color: activeTab === 'home' ? 'white' : (darkMode ? '#94a3b8' : '#64748b'),
              width: 50,
              height: 50,
              borderRadius: 14
            }}
          >
            <span style={{ fontSize: 22 }}>🏠</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { playClickSound(); setActiveTab('progress'); }}
            style={{ 
              ...styles.navButton, 
              background: activeTab === 'progress' ? '#2563eb' : 'transparent', 
              color: activeTab === 'progress' ? 'white' : (darkMode ? '#94a3b8' : '#64748b'),
              width: 50,
              height: 50,
              borderRadius: 14
            }}
          >
            <span style={{ fontSize: 22 }}>📊</span>
          </motion.button>
          
          <motion.a 
            href="https://wa.me/201015134800" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            style={{ 
              ...styles.navButton, 
              background: activeTab === 'support' ? '#25D366' : 'transparent', 
              color: activeTab === 'support' ? 'white' : '#25D366',
              textDecoration: 'none',
              cursor: 'pointer',
              width: 50,
              height: 50,
              borderRadius: 14
            }}
          >
            <span style={{ fontSize: 22 }}>💬</span>
          </motion.a>
        </div>
      )}

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
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 1000, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', transition: 'all 0.4s ease', minHeight: 70 },
  userName: { fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' },
  themeToggle: { width: 56, height: 28, borderRadius: 999, position: 'relative', cursor: 'pointer', padding: 4, overflow: 'hidden', transition: 'background-color 0.3s ease', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' },
  logoutBtn: { background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease' },
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
  footer: { textAlign: 'center', padding: '40px 20px 80px 20px', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', borderTop: '1px solid rgba(100,116,139,0.08)' },
  motivationBox: { margin: '10px auto 24px auto', padding: '18px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: 18, textAlign: 'center', fontSize: '1.15rem', fontWeight: 700, maxWidth: 500, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)', width: '90%' },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 12,
    zIndex: 1000,
    boxShadow: '0 -2px 15px rgba(0,0,0,0.15)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    margin: '0 8px'
  }
};