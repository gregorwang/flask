import { useEffect, useRef, useState } from "react";
import { getLyricStreamStyle, handleImageError, type ImageData } from "~/lib/imageUtils";

interface Lyric {
  text: string;
  song: string;
}

interface Album {
  id: number;
  title: string;
  cover: string;
  alt: string;
}

interface MusicKeywordsProps {
  lyrics: Lyric[];
  albums: Album[];
}

export function MusicKeywords({ lyrics, albums }: MusicKeywordsProps) {
  const keywordsRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [isKeywordsVisible, setIsKeywordsVisible] = useState(false);
  const [isLyricsVisible, setIsLyricsVisible] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // 年度关键词数据
  const keywords = [
    { text: "电影原声", color: "from-purple-500 to-pink-500", size: "text-3xl" },
    { text: "动漫治愈", color: "from-blue-500 to-cyan-500", size: "text-2xl" },
    { text: "日系音乐", color: "from-green-500 to-teal-500", size: "text-xl" },
    { text: "情感共鸣", color: "from-yellow-500 to-orange-500", size: "text-2xl" },
    { text: "跨语言", color: "from-indigo-500 to-purple-500", size: "text-xl" },
    { text: "治愈系", color: "from-pink-500 to-rose-500", size: "text-3xl" },
    { text: "纯音乐", color: "from-cyan-500 to-blue-500", size: "text-xl" },
    { text: "回忆杀", color: "from-orange-500 to-red-500", size: "text-2xl" },
  ];

  // 图片加载处理
  const handleImageLoad = (albumId: number) => {
    setLoadedImages(prev => new Set([...prev, albumId]));
  };

  // 图片错误处理已移至imageUtils

  // 歌词轮播效果
  useEffect(() => {
    if (isLyricsVisible && lyrics.length > 0) {
      const interval = setInterval(() => {
        setCurrentLyricIndex(prev => (prev + 1) % lyrics.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isLyricsVisible, lyrics.length]);

  // 滚动观察器
  useEffect(() => {
    const keywordsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsKeywordsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const lyricsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLyricsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (keywordsRef.current) {
      keywordsObserver.observe(keywordsRef.current);
    }
    
    if (lyricsRef.current) {
      lyricsObserver.observe(lyricsRef.current);
    }

    return () => {
      keywordsObserver.disconnect();
      lyricsObserver.disconnect();
    };
  }, []);

  return (
    <section className="relative py-20 px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* 年度关键词部分 */}
      <div ref={keywordsRef} className="mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            年度音乐关键词
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            用关键词解读你的音乐品味密码
          </p>
        </div>

        {/* 关键词云 */}
        <div className="keywords-container max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4">
            {keywords.map((keyword, index) => (
              <div
                key={keyword.text}
                className={`keyword group cursor-pointer transition-all duration-700 ${
                  isKeywordsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className={`${keyword.size} font-bold bg-gradient-to-r ${keyword.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                  {keyword.text}
                </span>
                
                {/* 悬停光效 */}
                <div className={`absolute inset-0 bg-gradient-to-r ${keyword.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>

        {/* 专辑展示 */}
        <div className={`albums-grid mt-16 transition-all duration-1000 delay-500 ${
          isKeywordsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {albums.map((album, index) => (
            <div
              key={album.id}
              className="album-item group cursor-pointer"
              style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                {/* 加载占位符 */}
                {!loadedImages.has(album.id) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                
                {/* 专辑封面 */}
                <img
                  src={album.cover}
                  alt={album.alt}
                  data-album-id={album.id}
                  onError={(e) => handleImageError(e, album.id.toString())}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                    loadedImages.has(album.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(album.id)}
                  loading="lazy"
                />
                
                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 专辑信息 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium truncate">{album.title}</p>
                </div>
                
                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30">
                    <i className="fas fa-play text-white text-xl ml-1"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 精选歌词部分 */}
      <div ref={lyricsRef} className="lyrics-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            歌词流动星河
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            那些触动心弦的歌词片段，如星光般闪烁
          </p>
        </div>

        {/* 歌词轮播 */}
        <div className="relative max-w-4xl mx-auto">
          {lyrics.map((lyric, index) => (
            <div
              key={index}
              className={`lyric-item absolute inset-0 transition-all duration-1000 ${
                index === currentLyricIndex && isLyricsVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="text-center">
                {/* 歌词文本 */}
                <blockquote className="lyric-text text-2xl md:text-3xl font-light leading-relaxed mb-6 text-white">
                  "{lyric.text}"
                </blockquote>
                
                {/* 歌曲来源 */}
                <cite className="lyric-source text-lg text-gray-400 not-italic">
                  — {lyric.song}
                </cite>
                
                {/* 装饰线条 */}
                <div className="mt-8 flex items-center justify-center">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <div className="w-2 h-2 bg-white/50 rounded-full mx-4" />
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>
            </div>
          ))}
          
          {/* 占位空间 */}
          <div className="opacity-0 pointer-events-none">
            <div className="text-2xl md:text-3xl font-light leading-relaxed mb-6">
              占位文本占位文本占位文本占位文本
            </div>
            <div className="text-lg mb-8">
              占位来源
            </div>
            <div className="h-8" />
          </div>
        </div>

        {/* 歌词导航点 */}
        <div className="flex justify-center mt-12 space-x-3">
          {lyrics.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentLyricIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentLyricIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`显示第 ${index + 1} 条歌词`}
            />
          ))}
        </div>

        {/* 歌词统计 */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-300 ${
          isLyricsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">歌词印象</h3>
            <p className="text-gray-300 leading-relaxed">
              这些歌词片段记录了你音乐旅程中的情感瞬间，
              每一句都承载着特定时刻的心境与回忆。
              它们如同星河中的亮点，指引着你的音乐品味方向。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MusicKeywords;