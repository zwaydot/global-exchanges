import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });
  const isActive = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      isActive.current = true;

      // Create particles on move
      const distance = Math.hypot(
        mouse.current.x - lastMouse.current.x, 
        mouse.current.y - lastMouse.current.y
      );
      
      // Interpolate particles for smoother lines if moving fast
      const steps = Math.min(distance, 10); 
      
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const x = lastMouse.current.x + (mouse.current.x - lastMouse.current.x) * t;
        const y = lastMouse.current.y + (mouse.current.y - lastMouse.current.y) * t;
        
        createParticle(x, y);
      }

      lastMouse.current = { ...mouse.current };
    };

    const createParticle = (x: number, y: number) => {
      // Random colors between Cyan and Amber to match theme
      const colors = [
        'rgba(34, 211, 238, alpha)', // Cyan-400
        'rgba(251, 191, 36, alpha)', // Amber-400
        'rgba(255, 255, 255, alpha)' // White
      ];
      const colorBase = colors[Math.floor(Math.random() * colors.length)];

      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5, // Random spread
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        color: colorBase,
        life: 1,
        maxLife: Math.random() * 20 + 10 // Short life
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Fade out speed
        p.size *= 0.95; // Shrink

        if (p.life <= 0 || p.size < 0.1) {
          particles.current.splice(i, 1);
          i--;
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('alpha', p.life.toString());
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }} // Helps particles glow
    />
  );
};

