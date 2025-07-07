import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { MusicHero } from "~/components/music/MusicHero";
import { MusicTimeline } from "~/components/music/MusicTimeline";
import { MusicStats } from "~/components/music/MusicStats";
import { MusicKeywords } from "~/components/music/MusicKeywords";
import { ArtistShowcase } from "~/components/music/ArtistShowcase";
import { StarfieldBackground } from "~/components/music/StarfieldBackground";
import { ScrollProgress } from "~/components/music/ScrollProgress";
import musicStyles from "~/styles/music.css";

// Remix Meta函数
export const meta: MetaFunction = () => {
  return [
    { title: "音乐星河DNA - 音乐品味分析" },
    { name: "description", content: "探索音乐星河，发现你的音乐DNA。从电影原声到动漫治愈，跨越时空的音乐品味分析。" },
    { name: "keywords", content: "音乐,DNA,分析,星河,品味,电影原声,动漫,治愈" },
    { property: "og:title", content: "音乐星河DNA - 音乐品味分析" },
    { property: "og:description", content: "探索音乐星河，发现你的音乐DNA" },
    { property: "og:type", content: "website" },
  ];
};

// Remix Links函数 - 预加载样式和字体
export const links = () => [
  { rel: "stylesheet", href: musicStyles },
  { rel: "preload", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap", as: "style" },
  { rel: "preload", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css", as: "style" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap" },
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" },
];

// 音乐数据类型定义
interface MusicData {
  dnaImages: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  musicImages: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  albums: Array<{
    id: number;
    title: string;
    cover: string;
    alt: string;
  }>;
  lyrics: Array<{
    text: string;
    song: string;
  }>;
  stats: {
    totalMinutes: number;
    totalSongs: number;
    computerHours: number;
    podcastHours: number;
  };
  timeline: Array<{
    year: number;
    title: string;
    artist: string;
    category: string;
    imageId: string;
    gradient: string;
  }>;
}

// Remix Loader函数 - SSR数据预加载
export async function loader({ request }: LoaderFunctionArgs) {
  // 模拟数据获取 - 在实际应用中这里会从数据库或API获取
  const musicData: MusicData = {
    dnaImages: [
      { id: 'dd', src: '/SVG/dd.jpg', alt: '梦醒时分 - 梁静茹' },
      { id: 'i', src: '/SVG/i.jpg', alt: 'Killer Song - 麻枝准' },
      { id: 'd', src: '/SVG/d.jpg', alt: 'The Ray of Light - Vivienne' },
      { id: 'a', src: '/SVG/a.jpg', alt: 'Headlight - MONKEY MAJIK' },
      { id: 'r', src: '/SVG/r.jpg', alt: 'Renaissance - Steve James' },
      { id: 'u', src: '/SVG/u.jpg', alt: '小满 - 音阙诗听' },
      { id: 'v', src: '/SVG/v.jpg', alt: 'SLUMP - Stray Kids' },
      { id: 'bb', src: '/SVG/bb.jpg', alt: 'Phantom - Vivienne' },
      { id: 'h', src: '/SVG/h.jpg', alt: 'Letting Go - 蔡健雅' },
      { id: 'm', src: '/SVG/m.jpg', alt: 'Somebody That I Used To - TRONICBOX' },
      { id: 'y', src: '/SVG/y.jpg', alt: 'rich-man - 林ゆうき' },
    ],
    musicImages: [
      { id: 'f', src: '/SVG/f.jpg', alt: 'Vivienne' },
      { id: 'ee', src: '/SVG/ee.jpg', alt: '四季音色' },
      { id: '0', src: '/SVG/0.jpg', alt: 'FELT 2020' },
      { id: 'o', src: '/SVG/o.jpg', alt: 'FELT 2019' },
    ],
    albums: [
      { id: 1, title: 'FELT Album 1', cover: '/SVG/n.jpg', alt: 'FELT Album 1 Cover' },
      { id: 2, title: 'FELT Album 2', cover: '/SVG/t.jpg', alt: 'FELT Album 2 Cover' },
      { id: 3, title: 'FELT Album 3', cover: '/SVG/w.jpg', alt: 'FELT Album 3 Cover' },
      { id: 4, title: 'FELT Album 4', cover: '/SVG/g.jpg', alt: 'FELT Album 4 Cover' },
    ],
    lyrics: [
      { 
        text: "我是离开，无名的人啊，我敬你一杯酒，敬你的沉默和每一声怒吼", 
        song: "孙楠/陈楚生《无名之辈》"
      },
      { 
        text: "I will never gonna leave you never wanna lose you，we'll make it in the end", 
        song: "前島麻由《longshot》"
      },
      { 
        text: "まっしろまっしろ まっしろな雪が降る", 
        song: "水瀬ましろ《まっしろな雪》"
      },
      { 
        text: "Petals dance for our valediction，And synchronize to your frozen pulsation", 
        song: "mili《Nine Point Eight》"
      },
      { 
        text: "That since then I've found my way back...but I'll miss you", 
        song: "Vivienne《Goodbye》"
      },
      { 
        text: "And now that I understand, have I the courage to try", 
        song: "Vivienne《Phantom》"
      },
    ],
    stats: {
      totalMinutes: 99999,
      totalSongs: 6869,
      computerHours: 128,
      podcastHours: 2,
    },
    timeline: [
      {
        year: 2015,
        title: "梦醒时分 (Live)",
        artist: "梁静茹",
        category: "原声星座",
        imageId: "dd",
        gradient: "from-purple-600 to-blue-600"
      },
      {
        year: 2017,
        title: "Killer Song",
        artist: "麻枝准/やなぎなぎ",
        category: "分享星云",
        imageId: "i",
        gradient: "from-indigo-600 to-purple-600"
      },
      {
        year: 2017,
        title: "The Ray of Light",
        artist: "Vivienne",
        category: "光芒星团",
        imageId: "d",
        gradient: "from-blue-600 to-cyan-600"
      },
      {
        year: 2018,
        title: "Headlight",
        artist: "MONKEY MAJIK",
        category: "心动星系",
        imageId: "a",
        gradient: "from-cyan-600 to-teal-600"
      },
      {
        year: 2019,
        title: "Renaissance",
        artist: "Steve James/Clairity",
        category: "日出星座",
        imageId: "r",
        gradient: "from-teal-600 to-green-600"
      },
      {
        year: 2024,
        title: "rich-man",
        artist: "林ゆうき",
        category: "超新星",
        imageId: "y",
        gradient: "from-yellow-500 to-orange-500"
      },
    ],
  };

  // 返回带缓存头的JSON响应
  return json(musicData, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// 主组件
export default function MusicPage() {
  const data = useLoaderData<typeof loader>();
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  // 滚动进度处理
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled / (document.body.scrollHeight - window.innerHeight);
      
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.transform = `scaleX(${rate})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="starfield-bg text-white overflow-x-hidden relative">
      {/* 星空背景 */}
      <StarfieldBackground />
      
      {/* 滚动进度条 */}
      <ScrollProgress ref={scrollIndicatorRef} />
      
      {/* 主容器 */}
      <div className="min-h-screen relative z-10">
        {/* DNA音乐展示区域 */}
        <MusicHero 
          dnaImages={data.dnaImages}
          stats={data.stats}
        />

        {/* 音乐时间线 */}
        <MusicTimeline 
          timeline={data.timeline}
          dnaImages={data.dnaImages}
        />

        {/* 听歌统计 */}
        <MusicStats stats={data.stats} />

        {/* 年度关键词和歌词 */}
        <MusicKeywords 
          lyrics={data.lyrics}
          albums={data.albums}
        />

        {/* 年度歌手展示 */}
        <ArtistShowcase musicImages={data.musicImages} />
      </div>
    </div>
  );
}

// 错误边界
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">音乐星河暂时无法访问</h1>
        <p className="text-lg mb-8">请稍后再试，或返回首页</p>
        <a 
          href="/" 
          className="bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-full px-6 py-3 text-white font-medium transition-all duration-300"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}