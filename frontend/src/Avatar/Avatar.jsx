// Avatar.jsx
// Renders the 3D teacher head/bust and drives it every frame from an
// AvatarController instance. No lip sync, no facial rig authoring — just
// morph target influence values mapped from procedural animation state.

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Replace this file with the real Ready Player Me (or equivalent) export.
// Expected: realistic female avatar, blue/white outfit, ARKit-style morph
// targets (mouthOpen/jawOpen, eyeBlinkLeft, eyeBlinkRight) on at least one mesh.
const MODEL_PATH = '/avatar/teacher.glb';

const MORPH_TARGETS = {
    blinkLeft: ['eyeBlinkLeft', 'eyesClosedLeft', 'eyeClosedLeft'],
    blinkRight: ['eyeBlinkRight', 'eyesClosedRight', 'eyeClosedRight'],
    mouthOpen: ['mouthOpen', 'jawOpen', 'viseme_aa', 'mouthOpenAA'],
};

function findMorphIndex(dictionary, candidates) {
    for (let i = 0; i < candidates.length; i += 1) {
        if (dictionary[candidates[i]] !== undefined) return dictionary[candidates[i]];
    }
    return -1;
}

function applyMorph(mesh, candidates, value) {
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    const idx = findMorphIndex(mesh.morphTargetDictionary, candidates);
    if (idx >= 0) {
        mesh.morphTargetInfluences[idx] = value;
    }
}

function TeacherModel({ controller }) {
    const group = useRef();
    const headBone = useRef(null);
    const morphMeshes = useRef([]);
    const scanned = useRef(false);

    const { scene } = useGLTF(MODEL_PATH);

    useFrame((_, delta) => {
        if (!scanned.current && scene) {
            morphMeshes.current = [];
            scene.traverse((node) => {
                if (node.isMesh && node.morphTargetDictionary) {
                    morphMeshes.current.push(node);
                }
                if (node.isBone && /^head$/i.test(node.name)) {
                    headBone.current = node;
                }
            });
            scanned.current = true;
        }

        const values = controller.update(delta);

        for (let i = 0; i < morphMeshes.current.length; i += 1) {
            const mesh = morphMeshes.current[i];
            applyMorph(mesh, MORPH_TARGETS.blinkLeft, values.blink);
            applyMorph(mesh, MORPH_TARGETS.blinkRight, values.blink);
            applyMorph(mesh, MORPH_TARGETS.mouthOpen, values.mouthOpen);
        }

        const headTarget = headBone.current || group.current;
        if (headTarget) {
            headTarget.rotation.x = values.headRotation.x;
            headTarget.rotation.y = values.headRotation.y;
            headTarget.rotation.z = values.headRotation.z;
        }

        if (group.current) {
            group.current.position.y = -1.55 + values.floatOffset;
            const breatheScale = 1 + values.breathe * 0.006;
            group.current.scale.set(breatheScale, breatheScale, breatheScale);
        }
    });

    // NOTE: position/scale tuned for a standard full-body RPM export framed
    // as a bust shot. Re-tune once the real teacher.glb is dropped in.
    return (
        <group ref={group} position={[0, -1.55, 0]}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(MODEL_PATH);

export default function Avatar({ controller }) {
    return (
        <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0.05, 0.85], fov: 28 }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.9} />
            <directionalLight position={[0.5, 1, 1]} intensity={1.1} />
            <directionalLight position={[-0.6, 0.3, -0.5]} intensity={0.35} color="#a8c8ff" />
            <Suspense fallback={null}>
                <TeacherModel controller={controller} />
            </Suspense>
        </Canvas>
    );
}
