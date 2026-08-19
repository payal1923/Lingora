// AvatarAnimator.jsx
// The component the rest of the app actually uses. Wraps the 3D Avatar in a
// premium glass card, keeps it visible (floating or inline), shows a status
// badge, and gracefully falls back to a CSS avatar if the GLB fails to load.

import { Component, Suspense } from 'react';
import Avatar from './Avatar';
import PrimitiveAvatar from './PrimitiveAvatar';
import VoiceWave from '../Components/VoiceWave';
import { useAvatarAnimation } from '../Hooks/useAvatarAnimation';

// Catches the Suspense rejection thrown by useGLTF when public/avatar/teacher.glb
// doesn't exist yet (or fails to load) and swaps in the fully-animated
// primitive avatar instead — same controller, same states, zero visual gap.
// Once a real teacher.glb is dropped in, useGLTF resolves normally and this
// boundary never triggers, so PrimitiveAvatar is automatically retired
// without touching this file again.
class AvatarErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        // eslint-disable-next-line no-console
        console.warn('[Avatar] teacher.glb not found/failed to load — using primitive fallback.', error?.message);
    }

    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

const STATUS_CONFIG = {
    talking: { label: 'Speaking', color: 'bg-emerald-400' },
    thinking: { label: 'Thinking', color: 'bg-amber-400' },
    listening: { label: 'Listening', color: 'bg-sky-400' },
    idle: { label: 'Online', color: 'bg-emerald-400' },
};

const SIZE_CLASSES = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
};

export default function AvatarAnimator({
    isSpeaking = false,
    isThinking = false,
    isListening = false,
    variant = 'floating', // 'floating' | 'inline'
    size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
    showStatus = true,
    className = '',
}) {
    const controller = useAvatarAnimation({ isSpeaking, isThinking, isListening });

    const activeState = isSpeaking
        ? 'talking'
        : isThinking
            ? 'thinking'
            : isListening
                ? 'listening'
                : 'idle';

    const status = STATUS_CONFIG[activeState];
    const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const positionClasses = variant === 'floating' ? 'fixed bottom-24 right-4 z-40' : 'relative';

    return (
        <div className={`${positionClasses} ${className}`}>
            <div
                className={`relative ${sizeClasses} rounded-full overflow-hidden
        bg-white/30 backdrop-blur-xl border border-white/40
        shadow-[0_8px_32px_rgba(31,38,135,0.25)]
        ring-1 ring-white/50 transition-transform duration-300
        ${isSpeaking ? 'scale-105' : 'scale-100'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 via-transparent to-indigo-100/40 pointer-events-none z-10" />

                <AvatarErrorBoundary fallback={<PrimitiveAvatar controller={controller} />}>
                    <Suspense fallback={<PrimitiveAvatar controller={controller} />}>
                        <Avatar controller={controller} />
                    </Suspense>
                </AvatarErrorBoundary>

                {isSpeaking && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20">
                        <VoiceWave active={isSpeaking} barCount={5} size="xs" color="white" />
                    </div>
                )}
            </div>

            {showStatus && (
                <div
                    className="absolute -bottom-1 -right-1 flex items-center gap-1.5
                    bg-white/90 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1
                    shadow-md border border-white/60 z-20"
                >
                    <span className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
                    <span className="text-[10px] font-semibold text-slate-600 tracking-wide">
                        {status.label}
                    </span>
                </div>
            )}
        </div>
    );
}
