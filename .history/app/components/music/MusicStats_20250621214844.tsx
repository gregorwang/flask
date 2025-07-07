import { useEffect, useRef, useState } from "react";

interface Stats {
  totalMinutes: number;
  totalSongs: number;
  computerHours: number;
  podcastHours: number;
}

interface MusicStatsProps {
  stats: Stats;
}

export function MusicStats({ stats }: MusicStatsProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalMinutes: 0,
    totalSongs: 0,
    computerHours: 0,
    podcastHours: 0,
  });

  // 数字动画效果
  const animateNumber = (start: number, end: number, duration: number, callback: (value: number) => void) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      callback(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  // 滚动观察器
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          // 启动数字动画
          setTimeout(() => {
            animateNumber(0, stats.totalMinutes, 2000, (value) => {
              setAnimatedStats(prev => ({ ...prev, totalMinutes: value }));
            });
          }, 200);
          
          setTimeout(() => {
            animateNumber(0, stats.totalSongs, 2200, (value) => {
              setAnimatedStats(prev => ({ ...prev, totalSongs: value }));
            });
          }, 400);
          
          setTimeout(() => {
            animateNumber(0, stats.computerHours, 1800, (value) => {
              setAnimatedStats(prev => ({ ...prev, computerHours: value }));
            });
          }, 600);
          
          setTimeout(() => {
            animateNumber(0, stats.podcastHours, 1500, (value) => {
              setAnimatedStats(prev => ({ ...prev, podcastHours: value }));
            });
          }, 800);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [stats, isVisible]);

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  // 计算百分比用于进度条
  const getPercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <section ref={statsRef} className="relative py-20 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/6 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
        <div className="absolute bottom-1/3 right-1/6 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />
      </div>

      {/* 标题 */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          听歌时间统计
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          用数据记录音乐陪伴的每一个时刻
        </p>
      </div>

      {/* 统计卡片网格 */}
      <div className="stats-container max-w-6xl mx-auto">
        {/* 总听歌分钟 */}
        <div className={`stat-card group transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="relative">
            {/* 图标 */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-clock text-2xl text-white"></i>
            </div>
            
            {/* 数字 */}
            <div className="stat-number text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formatNumber(animatedStats.totalMinutes)}
            </div>
            
            {/* 标签 */}
            <div className="stat-label text-gray-300 text-lg font-medium mb-4">
              总听歌分钟
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-2000 ease-out"
                style={{ width: isVisible ? '100%' : '0%' }}
              />
            </div>
            
            {/* 额外信息 */}
            <div className="mt-3 text-sm text-gray-400">
              约 {Math.floor(animatedStats.totalMinutes / 60).toLocaleString()} 小时
            </div>
          </div>
        </div>

        {/* 总歌曲数 */}
        <div className={`stat-card group transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="relative">
            {/* 图标 */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-music text-2xl text-white"></i>
            </div>
            
            {/* 数字 */}
            <div className="stat-number text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {formatNumber(animatedStats.totalSongs)}
            </div>
            
            {/* 标签 */}
            <div className="stat-label text-gray-300 text-lg font-medium mb-4">
              总歌曲数
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-2000 ease-out delay-200"
                style={{ width: isVisible ? '95%' : '0%' }}
              />
            </div>
            
            {/* 额外信息 */}
            <div className="mt-3 text-sm text-gray-400">
              平均每天 {Math.floor(animatedStats.totalSongs / 365)} 首
            </div>
          </div>
        </div>

        {/* 电脑听歌小时 */}
        <div className={`stat-card group transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="relative">
            {/* 图标 */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-desktop text-2xl text-white"></i>
            </div>
            
            {/* 数字 */}
            <div className="stat-number text-5xl font-black mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              {animatedStats.computerHours}
            </div>
            
            {/* 标签 */}
            <div className="stat-label text-gray-300 text-lg font-medium mb-4">
              电脑听歌小时
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-2000 ease-out delay-400"
                style={{ width: isVisible ? `${getPercentage(animatedStats.computerHours, 200)}%` : '0%' }}
              />
            </div>
            
            {/* 额外信息 */}
            <div className="mt-3 text-sm text-gray-400">
              工作时的音乐伴侣
            </div>
          </div>
        </div>

        {/* 播客小时 */}
        <div className={`stat-card group transition-all duration-1000 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="relative">
            {/* 图标 */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-podcast text-2xl text-white"></i>
            </div>
            
            {/* 数字 */}
            <div className="stat-number text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {animatedStats.podcastHours}
            </div>
            
            {/* 标签 */}
            <div className="stat-label text-gray-300 text-lg font-medium mb-4">
              播客小时
            </div>
            
            {/* 进度条 */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-2000 ease-out delay-600"
                style={{ width: isVisible ? `${getPercentage(animatedStats.podcastHours, 10)}%` : '0%' }}
              />
            </div>
            
            {/* 额外信息 */}
            <div className="mt-3 text-sm text-gray-400">
              知识与音乐并行
            </div>
          </div>
        </div>
      </div>

      {/* 总结信息 */}
      <div className={`mt-16 text-center transition-all duration-1000 delay-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">音乐陪伴总结</h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            在过去的时光里，音乐陪伴了你 <span className="text-purple-400 font-semibold">{formatNumber(animatedStats.totalMinutes)}</span> 分钟，
            共计 <span className="text-blue-400 font-semibold">{formatNumber(animatedStats.totalSongs)}</span> 首歌曲。
            无论是在电脑前工作的 <span className="text-green-400 font-semibold">{animatedStats.computerHours}</span> 小时，
            还是聆听播客的 <span className="text-yellow-400 font-semibold">{animatedStats.podcastHours}</span> 小时，
            音乐都是你最忠实的伙伴。
          </p>
        </div>
      </div>
    </section>
  );
}

export default MusicStats;