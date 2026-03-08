// Logo Component

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { wheel: 32, text: 'text-lg' },
    md: { wheel: 48, text: 'text-xl' },
    lg: { wheel: 64, text: 'text-2xl' },
    xl: { wheel: 96, text: 'text-4xl' },
  };

  const { wheel, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {/* Professional Spin Wheel Logo */}
      <div className="relative" style={{ width: wheel, height: wheel }}>
        {/* Outer ring - Gold */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {/* Shadow */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Outer gold ring */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradient)" strokeWidth="4" filter="url(#shadow)" />
          
          {/* Wheel segments */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180);
            const nextAngle = ((i + 1) * 45 - 90) * (Math.PI / 180);
            const x1 = 50 + 40 * Math.cos(angle);
            const y1 = 50 + 40 * Math.sin(angle);
            const x2 = 50 + 40 * Math.cos(nextAngle);
            const y2 = 50 + 40 * Math.sin(nextAngle);
            
            const colors = ['#059669', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#fbbf24', '#14b8a6', '#8b5cf6'];
            
            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`}
                fill={colors[i]}
                stroke="#1e293b"
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Center circle */}
          <circle cx="50" cy="50" r="12" fill="url(#goldGradient)" stroke="#1e293b" strokeWidth="1" />
          
          {/* Center emblem - Nigerian flag inspired */}
          <rect x="45" y="44" width="3" height="12" fill="#008751" rx="0.5" />
          <rect x="48" y="44" width="4" height="12" fill="#ffffff" rx="0" />
          <rect x="52" y="44" width="3" height="12" fill="#008751" rx="0.5" />
          
          {/* Pointer */}
          <polygon points="50,8 45,18 55,18" fill="url(#emeraldGradient)" stroke="#064e3b" strokeWidth="1" />
        </svg>
        
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full pointer-events-none" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${text} leading-none`} style={{ fontFamily: 'Space Grotesk' }}>
            <span className="text-emerald-400">Spin</span>
            <span className="text-amber-400">9ja</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-slate-400 tracking-wider">SPIN & EARN</span>
          )}
        </div>
      )}
    </div>
  );
}
