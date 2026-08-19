// useAvatarAnimation.js
// Owns a single AvatarController instance for the lifetime of the component.
// Does NOT run its own rAF loop — the Three.js render loop (useFrame in
// Avatar.jsx) drives controller.update() to avoid double render loops and
// unnecessary React re-renders on every frame.

import { useRef, useEffect } from 'react';
import { AvatarController, AVATAR_STATES } from '../Avatar/AvatarController';

export function useAvatarAnimation({
  isSpeaking = false,
  isThinking = false,
  isListening = false,
} = {}) {
  const controllerRef = useRef(null);

  if (!controllerRef.current) {
    controllerRef.current = new AvatarController();
  }

  useEffect(() => {
    const controller = controllerRef.current;

    // Priority: speaking > thinking > listening > idle
    if (isSpeaking) {
      controller.setState(AVATAR_STATES.TALKING);
    } else if (isThinking) {
      controller.setState(AVATAR_STATES.THINKING);
    } else if (isListening) {
      controller.setState(AVATAR_STATES.LISTENING);
    } else {
      controller.setState(AVATAR_STATES.IDLE);
    }
  }, [isSpeaking, isThinking, isListening]);

  return controllerRef.current;
}

export default useAvatarAnimation;
