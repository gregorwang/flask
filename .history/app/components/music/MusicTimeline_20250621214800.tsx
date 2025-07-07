import { useEffect, useRef, useState } from "react";

interface TimelineItem {
  year: number;
  title: string;
  artist: string;
  category: string;
  imageId: string;
  gradient: string;
}

interface DNAImage {
  id: string;
  src: string;
  alt: string;
}

interface MusicTimelineProps {
  timeline: TimelineItem[];
  dnaImages: DNAImage[];
}

export function MusicTimeline({ timeline, dnaImages }: MusicTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // 获取对应的图片
  const getImageForItem = (imageId: string) => {
    return dnaImages.find(img => img.id === imageId);
  };

  // 图片加载处理
  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.src = '/images/placeholder.jpg';
  };

  // 滚动动画观察器
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const timelineItems = timelineRef.current?.querySelectorAll('.timeline-item');
    timelineItems?.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-20 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 标题 */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          音乐星系螺旋时间线
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          穿越时空，回顾每一个音乐瞬间的星光轨迹
        </p>
      </div>

      {/* 时间线容器 */}
      <div ref={timelineRef} className="music-timeline relative">
        {/* 中央连接线 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 transform -translate-x-1/2 hidden md:block" />
        
        {timeline.map((item, index) => {
          const image = getImageForItem(item.imageId);
          const isVisible = visibleItems.has(index);
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={`${item.year}-${item.title}`}
              className={`timeline-item relative mb-16 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              data-index={index}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* 移动端布局 */}
              <div className="md:hidden">
                <div className="flex items-center space-x-4 mb-4">
                  {/* 年份 */}
                  <div className={`timeline-year text-4xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.year}
                  </div>
                  
                  {/* 图片 */}
                  {image && (
                    <div className="timeline-image w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {!loadedImages.has(image.id) && (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse flex items-center justify-center">
                          <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                      <img
                        src={image.src}
                        alt={image.alt}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(image.id)}
                        onError={handleImageError}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
                
                {/* 内容 */}
                <div className="timeline-content bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-gradient-to-r ${item.gradient} text-white`}>
                    {item.category}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-300">{item.artist}</p>
                </div>
              </div>

              {/* 桌面端布局 */}
              <div className="hidden md:flex items-center">
                {isEven ? (
                  // 左侧布局
                  <>
                    <div className="flex-1 pr-8">
                      <div className="timeline-content bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-right">
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-3 bg-gradient-to-r ${item.gradient} text-white`}>
                          {item.category}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-300 text-lg">{item.artist}</p>
                      </div>
                    </div>
                    
                    {/* 中央年份和连接点 */}
                    <div className="relative flex flex-col items-center">
                      <div className={`timeline-year text-5xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-4`}>
                        {item.year}
                      </div>
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.gradient} border-4 border-white shadow-lg`} />
                    </div>
                    
                    {/* 右侧图片 */}
                    <div className="flex-1 pl-8">
                      {image && (
                        <div className="timeline-image w-48 h-48 rounded-xl overflow-hidden mx-auto group cursor-pointer">
                          {!loadedImages.has(image.id) && (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
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
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // 右侧布局
                  <>
                    {/* 左侧图片 */}
                    <div className="flex-1 pr-8">
                      {image && (
                        <div className="timeline-image w-48 h-48 rounded-xl overflow-hidden mx-auto group cursor-pointer">
                          {!loadedImages.has(image.id) && (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
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
                        </div>
                      )}
                    </div>
                    
                    {/* 中央年份和连接点 */}
                    <div className="relative flex flex-col items-center">
                      <div className={`timeline-year text-5xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-4`}>
                        {item.year}
                      </div>
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.gradient} border-4 border-white shadow-lg`} />
                    </div>
                    
                    {/* 右侧内容 */}
                    <div className="flex-1 pl-8">
                      <div className="timeline-content bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-3 bg-gradient-to-r ${item.gradient} text-white`}>
                          {item.category}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-300 text-lg">{item.artist}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MusicTimeline;