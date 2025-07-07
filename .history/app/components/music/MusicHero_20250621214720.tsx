import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

interface DNAImage {
  id: string;
  src: string;
  alt: string;
}

interface Stats {
  totalMinutes: number;
  totalSongs: number;
  computerHours: number;
  podcastHours: number;
}

interface MusicHeroProps {
  dnaImages: DNAImage[];
  stats: Stats;
}

export function MusicHero({ dnaImages, stats }: MusicHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // 图片懒加载处理
  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.src = '/images/placeholder.jpg'; // 备用图片
  };

  // 滚动动画效果
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 粒子效果样式生成
  const getParticleStyle = (index: number) => {
    const delay = Math.random() * 3;
    const duration = 3 + Math.random() * 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = 1 + Math.random() * 3;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    };
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20"
    >
      {/* 粒子背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="star absolute rounded-full bg-white opacity-60"
            style={getParticleStyle(i)}
          />
        ))}
      </div>

      {/* 主标题 */}
      <div className={`text-center mb-16 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          音乐星河DNA
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
          探索音乐星河，发现你的音乐DNA<br />
          从电影原声到动漫治愈，跨越时空的音乐品味分析
        </p>
      </div>

      {/* DNA音乐图片网格 */}
      <div className={`dna-container w-full max-w-6xl transition-all duration-1000 delay-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {dnaImages.map((image, index) => (
          <div
            key={image.id}
            className={`dna-image group transition-all duration-500`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative w-full h-full overflow-hidden rounded-xl">
              {/* 加载占位符 */}
              {!loadedImages.has(image.id) && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              
              {/* 实际图片 */}
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(image.id)}
                onError={handleImageError}
                loading="lazy"
              />
              
              {/* 悬停遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* 悬停信息 */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium truncate">{image.alt}</p>
              </div>
              
              {/* 光晕效果 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* 统计信息预览 */}
      <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl transition-all duration-1000 delay-600 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {stats.totalMinutes.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm md:text-base">总听歌分钟</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            {stats.totalSongs.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm md:text-base">总歌曲数</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
            {stats.computerHours}
          </div>
          <div className="text-gray-400 text-sm md:text-base">电脑听歌小时</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            {stats.podcastHours}
          </div>
          <div className="text-gray-400 text-sm md:text-base">播客小时</div>
        </div>
      </div>

      {/* 滚动提示 */}
      <div className={`mt-16 flex flex-col items-center transition-all duration-1000 delay-900 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <p className="text-gray-400 mb-4 text-sm md:text-base">向下滚动探索更多</p>
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default MusicHero;