import { useEffect, useRef } from 'react';

interface ConfettiProps {
  ariaHidden?: boolean;
}

export default function Confetti({ ariaHidden = true }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }[] = [];
    // Lê as cores de papel do tema atual via CSS (não usa hex solto em componente)
    const roleColors = [
      getComputedStyle(document.documentElement).getPropertyValue('--role-acao-principal').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--role-superficie-2').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--role-sucesso').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--role-aviso').trim(),
      getComputedStyle(document.documentElement).getPropertyValue('--role-erro').trim(),
    ].filter(Boolean);

    // Fallback seguro: se as variáveis CSS não carregarem, usa a ação principal
    const fallbackColor = roleColors[0] || 'var(--role-acao-principal)';

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        life: 1,
        color: roleColors[Math.floor(Math.random() * roleColors.length)] || fallbackColor,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // gravidade
        p.life -= 0.02;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '200px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      aria-hidden={ariaHidden}
    />
  );
}
