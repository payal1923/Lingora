// VoiceWave.jsx
// Lightweight animated equalizer bars. Self-contained CSS keyframes injected
// once at runtime so this works without any Tailwind config changes.

import { useEffect } from 'react';

const STYLE_ID = 'lingora-voicewave-styles';

function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML = `
    @keyframes lingora-wave {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1); }
    }
    .lingora-wave-bar {
      animation: lingora-wave 0.9s ease-in-out infinite;
      transform-origin: center;
    }
  `;
    document.head.appendChild(style);
}

const SIZE_MAP = {
    xs: { width: 'w-0.5', height: 'h-3', gap: 'gap-0.5' },
    sm: { width: 'w-1', height: 'h-4', gap: 'gap-1' },
    md: { width: 'w-1', height: 'h-6', gap: 'gap-1' },
};

const COLOR_MAP = {
    white: 'bg-white',
    indigo: 'bg-indigo-500',
    sky: 'bg-sky-400',
};

export default function VoiceWave({
    active = false,
    barCount = 5,
    size = 'sm',
    color = 'indigo',
}) {
    useEffect(() => {
        injectStyles();
    }, []);

    const dims = SIZE_MAP[size] || SIZE_MAP.sm;
    const barColor = COLOR_MAP[color] || COLOR_MAP.indigo;

    return (
        <div className={`flex items-center ${dims.gap} ${dims.height}`}>
            {Array.from({ length: barCount }).map((_, i) => (
                <span
                    key={i}
                    className={`lingora-wave-bar ${dims.width} ${dims.height} ${barColor} rounded-full`}
                    style={{
                        animationPlayState: active ? 'running' : 'paused',
                        animationDelay: `${i * 0.12}s`,
                        opacity: active ? 1 : 0.35,
                    }}
                />
            ))}
        </div>
    );
}
