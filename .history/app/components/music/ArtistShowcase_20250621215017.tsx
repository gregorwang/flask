import { useEffect, useRef, useState } from "react";

interface MusicImage {
  id: string;
  src: string;
  alt: string;
}

interface ArtistShowcaseProps {
  musicImages: MusicImage[];
}

export function ArtistShowcase({ musicImages }: ArtistShowcaseProps) {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // 艺术家信息映射
  const artistInfo = {
    'f': {
      name: 'Vivienne',
      description: '电子音乐制作人，以其独特的音乐风格和情感表达著称',
      genre: '电子/治愈',
      highlight: '代表作品包括《Phantom》、《Goodbye》等经典曲目'
    },
    'ee': {
      name: '四季音色',
      description: '日系音乐团体，专注于季节主题的音乐创作',
      genre: '日系/纯音乐',
      highlight: '以四季为灵感，创作出温暖治愈的音乐作品'
    },
    '0': {
      name: 'FELT',
      description: '知名同人音乐团体，2020年度精选作品集',
      genre: '同人/电子',
      highlight: '2020年度最受欢迎的同人音乐作品合集'
    },
    'o': {
      name: 'FELT',
      description: '知名同人音乐团体，2019年度精选作品集',
      genre: '同人/电子',
      highlight: '2019年度经典同人音乐作品回顾'
    }
  };

  // 图片加载处理
  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.src = '/images/placeholder.jpg';
  };

  // 滚动观察器
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (showcaseRef.current) {
      observer.observe(showcaseRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 获取艺术家信息
  const getArtistInfo = (imageId: string) => {
    return artistInfo[imageId as keyof typeof artistInfo] || {
      name: '未知艺术家',
      description: '暂无描述',
      genre: '未分类',
      highlight: '探索更多音乐作品'
    };
  };

  // 浮动动画样式
  const getFloatingStyle = (index: number) => {
    const delay = index * 0.5;
    const duration = 3 + (index % 3);
    return {
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    };
  };

  return (
    <section ref={showcaseRef} className="relative py-20 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-40 h-40 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-52 h-52 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* 标题 */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          年度歌手星座
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          那些陪伴你度过美好时光的音乐创作者们
        </p>
      </div>

      {/* 艺术家展示网格 */}
      <div className="artist-showcase max-w-7xl mx-auto">
        {musicImages.map((image, index) => {
          const artist = getArtistInfo(image.id);
          const isImageVisible = isVisible && loadedImages.has(image.id);
          
          return (
            <div
              key={image.id}
              className={`artist-card group cursor-pointer transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                ...getFloatingStyle(index)
              }}
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              {/* 艺术家图片容器 */}
              <div className="relative overflow-hidden">
                {/* 加载占位符 */}
                {!loadedImages.has(image.id) && (
                  <div className="artist-image bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                
                {/* 实际图片 */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`artist-image transition-all duration-700 group-hover:scale-110 ${
                    loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(image.id)}
                  onError={handleImageError}
                  loading="lazy"
                />
                
                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <i className="fas fa-play text-white text-2xl ml-1"></i>
                  </div>
                </div>
                
                {/* 光晕效果 */}
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${
                  hoveredImage === image.id ? 'animate-pulse' : ''
                }`} />
              </div>

              {/* 艺术家信息 */}
              <div className="artist-info relative">
                {/* 主要信息 */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {artist.name}
                  </h3>
                  
                  {/* 音乐类型标签 */}
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-full border border-white/20 mb-3">
                    <span className="text-sm font-medium text-purple-300">{artist.genre}</span>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {artist.description}
                  </p>
                </div>
                
                {/* 亮点信息 */}
                <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10">
                    <p className="text-sm text-gray-400 italic">
                      {artist.highlight}
                    </p>
                  </div>
                </div>
                
                {/* 装饰元素 */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 统计信息 */}
      <div className={`mt-20 text-center transition-all duration-1000 delay-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4">音乐品味分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {musicImages.length}
              </div>
              <div className="text-gray-300">年度重点艺术家</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                多元化
              </div>
              <div className="text-gray-300">音乐风格偏好</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
                治愈系
              </div>
              <div className="text-gray-300">主要音乐情感</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-300 leading-relaxed">
              你的音乐品味展现出对<span className="text-purple-400 font-semibold">情感深度</span>和
              <span className="text-blue-400 font-semibold">艺术质感</span>的追求。
              从电子音乐到同人作品，从日系治愈到跨语言创作，
              你的音乐世界充满了<span className="text-green-400 font-semibold">多样性</span>和
              <span className="text-pink-400 font-semibold">包容性</span>。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArtistShowcase;