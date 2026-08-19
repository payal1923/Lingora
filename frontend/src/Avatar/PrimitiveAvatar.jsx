// PrimitiveAvatar.jsx
// Zero-asset stand-in for Avatar.jsx. Built entirely from Three.js
// primitives (sphere head, box mouth, sphere eyes, cylinder body) so the
// app looks finished before teacher.glb exists. Takes the exact same
// `controller` prop as the real Avatar, so swapping components later is a
// one-line change in AvatarAnimator.jsx — no API differences.

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const COLORS = {
    skin: '#f0c8a0',
    hair: '#2e2118',
    blazer: '#ffffff',
    collar: '#2563eb',
    sclera: '#ffffff',
    pupil: '#1e293b',
    mouth: '#8a3b4a',
    brow: '#2e2118',
};

function PrimitiveFigure({ controller }) {
    const root = useRef();
    const headGroup = useRef();
    const body = useRef();
    const eyeL = useRef();
    const eyeR = useRef();
    const browL = useRef();
    const browR = useRef();
    const mouth = useRef();

    useFrame((_, delta) => {
        const v = controller.update(delta);

        // Root: float
        if (root.current) {
            root.current.position.y = v.floatOffset;
        }

        // Body: breathing (subtle chest rise)
        if (body.current) {
            const breatheScale = 1 + v.breathe * 0.015;
            body.current.scale.y = breatheScale;
        }

        // Head: rotation (talking sway / thinking look-up)
        if (headGroup.current) {
            headGroup.current.rotation.x = v.headRotation.x;
            headGroup.current.rotation.y = v.headRotation.y;
            headGroup.current.rotation.z = v.headRotation.z;
        }

        // Eyes: blink (squash Y) + subtle widen when listening
        const eyeScaleY = Math.max(0.05, 1 - v.blink * 0.95) * (1 + v.listenPulse * 0.12);
        if (eyeL.current) eyeL.current.scale.y = eyeScaleY;
        if (eyeR.current) eyeR.current.scale.y = eyeScaleY;

        // Eyebrows: raise slightly when listening (attentive look)
        const browLift = v.listenPulse * 0.012;
        if (browL.current) browL.current.position.y = 0.135 + browLift;
        if (browR.current) browR.current.position.y = 0.135 + browLift;

        // Mouth: open/close while talking
        if (mouth.current) {
            const openAmount = 0.12 + v.mouthOpen * 1.1;
            mouth.current.scale.y = openAmount;
        }
    });

    return (
        <group ref={root}>
            {/* Body / blazer */}
            <mesh ref={body} position={[0, -0.62, 0]}>
                <cylinderGeometry args={[0.34, 0.44, 0.55, 24]} />
                <meshStandardMaterial color={COLORS.blazer} roughness={0.6} />
            </mesh>

            {/* Collar accent */}
            <mesh position={[0, -0.36, 0.18]} rotation={[0.3, 0, 0]}>
                <torusGeometry args={[0.13, 0.025, 12, 24, Math.PI]} />
                <meshStandardMaterial color={COLORS.collar} roughness={0.5} />
            </mesh>

            {/* Neck */}
            <mesh position={[0, -0.28, 0]}>
                <cylinderGeometry args={[0.09, 0.1, 0.16, 16]} />
                <meshStandardMaterial color={COLORS.skin} roughness={0.7} />
            </mesh>

            {/* Head group — everything below rotates together for head movement */}
            <group ref={headGroup} position={[0, 0.02, 0]}>
                {/* Head */}
                <mesh scale={[1, 1.12, 0.95]}>
                    <sphereGeometry args={[0.26, 32, 32]} />
                    <meshStandardMaterial color={COLORS.skin} roughness={0.7} />
                </mesh>

                {/* Hair — back/top cap */}
                <mesh position={[0, 0.08, -0.03]} scale={[1.06, 1.02, 1.02]}>
                    <sphereGeometry args={[0.27, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
                    <meshStandardMaterial color={COLORS.hair} roughness={0.5} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.02, 0.245]}>
                    <coneGeometry args={[0.028, 0.06, 12]} />
                    <meshStandardMaterial color={COLORS.skin} roughness={0.7} />
                </mesh>

                {/* Eyes */}
                <mesh ref={eyeL} position={[-0.09, 0.04, 0.225]}>
                    <sphereGeometry args={[0.035, 16, 16]} />
                    <meshStandardMaterial color={COLORS.sclera} roughness={0.3} />
                </mesh>
                <mesh position={[-0.09, 0.04, 0.255]}>
                    <sphereGeometry args={[0.017, 12, 12]} />
                    <meshStandardMaterial color={COLORS.pupil} roughness={0.2} />
                </mesh>

                <mesh ref={eyeR} position={[0.09, 0.04, 0.225]}>
                    <sphereGeometry args={[0.035, 16, 16]} />
                    <meshStandardMaterial color={COLORS.sclera} roughness={0.3} />
                </mesh>
                <mesh position={[0.09, 0.04, 0.255]}>
                    <sphereGeometry args={[0.017, 12, 12]} />
                    <meshStandardMaterial color={COLORS.pupil} roughness={0.2} />
                </mesh>

                {/* Eyebrows */}
                <mesh ref={browL} position={[-0.09, 0.135, 0.23]} rotation={[0, 0, 0.05]}>
                    <boxGeometry args={[0.08, 0.018, 0.02]} />
                    <meshStandardMaterial color={COLORS.brow} roughness={0.6} />
                </mesh>
                <mesh ref={browR} position={[0.09, 0.135, 0.23]} rotation={[0, 0, -0.05]}>
                    <boxGeometry args={[0.08, 0.018, 0.02]} />
                    <meshStandardMaterial color={COLORS.brow} roughness={0.6} />
                </mesh>

                {/* Mouth */}
                <mesh ref={mouth} position={[0, -0.11, 0.235]}>
                    <boxGeometry args={[0.09, 0.03, 0.02]} />
                    <meshStandardMaterial color={COLORS.mouth} roughness={0.5} />
                </mesh>
            </group>
        </group>
    );
}

export default function PrimitiveAvatar({ controller }) {
    return (
        <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0.05, 0.95], fov: 30 }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.95} />
            <directionalLight position={[0.5, 1, 1]} intensity={1.1} />
            <directionalLight position={[-0.6, 0.3, -0.5]} intensity={0.35} color="#a8c8ff" />
            <PrimitiveFigure controller={controller} />
        </Canvas>
    );
}
