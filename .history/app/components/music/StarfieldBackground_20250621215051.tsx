import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  // 创建星星
  const createStars = (width: number, height: number, count: number = 150) => {
    const stars: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    
    return stars;
  };

  // 更新星星位置和闪烁
  const updateStars = (stars: Star[], width: number, height: number, mouseX: number, mouseY: number) => {
    stars.forEach(star => {
      // 缓慢移动
      star.y += star.speed;
      
      // 鼠标交互效果
      const mouseDistance = Math.sqrt(
        Math.pow(star.x - mouseX, 2) + Math.pow(star.y - mouseY, 2)
      );
      
      if (mouseDistance < 100) {
        const force = (100 - mouseDistance) / 100;
        const angle = Math.atan2(star.y - mouseY, star.x - mouseX);
        star.x += Math.cos(angle) * force * 0.5;
        star.y += Math.sin(angle) * force * 0.5;
      }
      
      // 边界检测
      if (star.y > height) {
        star.y = -star.size;
        star.x = Math.random() * width;
      }
      if (star.x < -star.size) {
        star.x = width + star.size;
      }
      if (star.x > width + star.size) {
        star.x = -star.size;
      }
      
      // 闪烁效果
      star.twinklePhase += star.twinkleSpeed;
      star.opacity = 0.3 + Math.sin(star.twinklePhase) * 0.5;
    });
  };

  // 绘制星星
  const drawStars = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    stars.forEach(star => {
      // 主星星
      ctx.save();
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = star.size * 2;
      ctx.shadowColor = '#ffffff';
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 十字光芒效果（对较大的星星）
      if (star.size > 1.5) {
        ctx.globalAlpha = star.opacity * 0.6;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(star.x, star.y - star.size * 3);
        ctx.lineTo(star.x, star.y + star.size * 3);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(star.x - star.size * 3, star.y);
        ctx.lineTo(star.x + star.size * 3, star.y);
        ctx.stroke();
      }
      
      ctx.restore();
    });
  };

  // 绘制连接线（星座效果）
  const drawConnections = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const star1 = stars[i];
        const star2 = stars[j];
        
        const distance = Math.sqrt(
          Math.pow(star1.x - star2.x, 2) + Math.pow(star1.y - star2.y, 2)
        );
        
        // 只连接距离较近的星星
        if (distance < 80) {
          const opacity = (80 - distance) / 80 * 0.3;
          ctx.globalAlpha = opacity;
          
          ctx.beginPath();
          ctx.moveTo(star1.x, star1.y);
          ctx.lineTo(star2.x, star2.y);
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  };

  // 动画循环
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    updateStars(starsRef.current, width, height, mouseRef.current.x, mouseRef.current.y);
    drawConnections(ctx, starsRef.current);
    drawStars(ctx, starsRef.current);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // 处理窗口大小变化
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // 重新创建星星
    starsRef.current = createStars(canvas.width, canvas.height);
  };

  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 初始化和清理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 设置canvas大小
    handleResize();
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // 开始动画
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Canvas星空 */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* CSS星空备用（性能较低设备） */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-50">
        {Array.from({ length: 50 }, (_, i) => {
          const style = {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          };
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
              style={style}
            />
          );
        })}
      </div>
      
      {/* 渐变遮罩 */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10" />
      </div>
    </>
  );
}

export default StarfieldBackground;