'use client';
import { useState, useEffect } from 'react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJQOWbtufjDTEmwwc55B4cz_SkMLU4gD48QL770YgJmhDeuht1fLJp8qt4eINACE7M/exec';

export default function HomePage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  // Filters
  const [stage, setStage] = useState<'all' | 'prep' | 'secondary'>('all');
  const [grade, setGrade] = useState<number | 'all'>('all');
  const [subject, setSubject] = useState<string>('all');

  const subjects: Record<string, string[][]> = {
    prep: [['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'الإحصاء'], ['الجبر', 'الهندسة', 'حساب المثلثات']],
    secondary: [['الجبر', 'الهندسة', 'حساب المثلثات'], ['الجبر', 'التفاضل والتكامل', 'حساب المثلثات'], ['الجبر', 'الهندسة الفراغية', 'التفاضل والتكامل', 'الاستاتيكا', 'الديناميكا']]
  };

  // تحميل الفيديوهات
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const url = `${GOOGLE_SCRIPT_URL}?t=${Date.now()}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('✅ تم تحميل الفيديوهات:', data);
      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ خطأ في تحميل الفيديوهات:', error);
    } finally {
      setLoading(false);
    }
  };

  // فلترة الفيديوهات
  const filteredVideos = videos.filter(video => {
    const [videoStage, videoGrade, videoSubject] = video.branch_id.split('-');
    
    if (stage !== 'all' && videoStage !== stage) return false;
    if (grade !== 'all' && videoGrade !== grade.toString()) return false;
    if (subject !== 'all' && videoSubject !== subject) return false;
    
    return true;
  });

  const openVideo = (video: any) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const getStageName = (stageCode: string) => {
    return stageCode === 'prep' ? 'الإعدادية' : 'الثانوية';
  };

  const getGradeName = (gradeCode: string) => {
    const grades = ['الأول', 'الثاني', 'الثالث'];
    return grades[parseInt(gradeCode)] || '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 10 }}>📚 منصة الباشمهندس سامح مجدي</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>هتفهم رياضيات بسهولة - فيديوهات شرح لجميع المراحل</p>
      </header>

      {/* Filters */}
      <div style={{ background: 'white', padding: 30, margin: '30px auto', maxWidth: 1000, borderRadius: 20, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: 20, color: '#1e293b' }}>🔍 ابحث عن الفيديوهات</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {/* المرحلة */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>المرحلة</label>
            <select 
              value={stage} 
              onChange={(e) => { setStage(e.target.value as any); setGrade('all'); setSubject('all'); }}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 15 }}
            >
              <option value="all">كل المراحل</option>
              <option value="prep">الإعدادية</option>
              <option value="secondary">الثانوية</option>
            </select>
          </div>

          {/* الصف */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>الصف</label>
            <select 
              value={grade} 
              onChange={(e) => { setGrade(e.target.value === 'all' ? 'all' : Number(e.target.value)); setSubject('all'); }}
              disabled={stage === 'all'}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 15, opacity: stage === 'all' ? 0.5 : 1 }}
            >
              <option value="all">كل الصفوف</option>
              {stage !== 'all' && ['الأول', 'الثاني', 'الثالث'].map((g, i) => (
                <option key={i} value={i}>{g}</option>
              ))}
            </select>
          </div>

          {/* المادة */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#475569' }}>المادة</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              disabled={grade === 'all' || stage === 'all'}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 15, opacity: (grade === 'all' || stage === 'all') ? 0.5 : 1 }}
            >
              <option value="all">كل المواد</option>
              {stage !== 'all' && grade !== 'all' && subjects[stage][grade as number].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset button */}
        {(stage !== 'all' || grade !== 'all' || subject !== 'all') && (
          <button 
            onClick={() => { setStage('all'); setGrade('all'); setSubject('all'); }}
            style={{ marginTop: 20, padding: '10px 20px', background: '#64748b', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            🔄 إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Videos Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 60px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#1e293b' }}>📹 الفيديوهات المتاحة ({filteredVideos.length})</h2>
          {loading && <span style={{ color: '#64748b' }}>⏳ جاري التحميل...</span>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p>جاري تحميل الفيديوهات...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ color: '#475569', marginBottom: 8 }}>لا توجد فيديوهات متاحة</h3>
            <p style={{ color: '#94a3b8' }}>جرب تغيير الفلاتر أو انتظر حتى يتم إضافة فيديوهات جديدة</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
            {filteredVideos.map((video, index) => (
              <div 
                key={video.id || index}
                style={{ 
                  background: 'white', 
                  borderRadius: 16, 
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer'
                }}
                onClick={() => openVideo(video)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#1e293b' }}>
                  <img 
                    src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                    alt={video.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/480x360/667eea/ffffff?text=Math+Video';
                    }}
                  />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: 16 }}>
                    <span style={{ fontSize: 24 }}>▶️</span>
                  </div>
                  {video.duration && (
                    <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: 20 }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: 18 }}>{video.title}</h3>
                  
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>
                      {getStageName(video.branch_id.split('-')[0])}
                    </span>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>
                      {getGradeName(video.branch_id.split('-')[1])}
                    </span>
                    <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>
                      {video.branch_id.split('-')[2]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.9)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
          onClick={closeVideo}
        >
          <div 
            style={{ 
              background: 'white', 
              borderRadius: 16, 
              maxWidth: 900, 
              width: '100%',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={closeVideo}
              style={{ 
                position: 'absolute', 
                top: 20, 
                left: 20, 
                background: 'rgba(255,255,255,0.9)', 
                border: 'none', 
                borderRadius: '50%', 
                width: 40, 
                height: 40,
                fontSize: 24,
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ✕
            </button>

            {/* Video */}
            <div style={{ paddingBottom: '56.25%', position: 'relative' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`}
                title={selectedVideo.title}
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info */}
            <div style={{ padding: 24 }}>
              <h2 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>{selectedVideo.title}</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px 16px', borderRadius: 20, fontSize: 14 }}>
                  {getStageName(selectedVideo.branch_id.split('-')[0])}
                </span>
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 16px', borderRadius: 20, fontSize: 14 }}>
                  {getGradeName(selectedVideo.branch_id.split('-')[1])}
                </span>
                <span style={{ background: '#d1fae5', color: '#059669', padding: '6px 16px', borderRadius: 20, fontSize: 14 }}>
                  {selectedVideo.branch_id.split('-')[2]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: '#1e293b', color: 'white', textAlign: 'center', padding: 30, marginTop: 60 }}>
        <p style={{ margin: 0, fontSize: 16 }}>© 2026 منصة الباشمهندس سامح مجدي - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}