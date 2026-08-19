// AvatarController.js
// Pure JS state machine that computes animation values every frame.
// No React / Three.js dependency — framework agnostic, easily testable.

export const AVATAR_STATES = {
  IDLE: 'idle',
  TALKING: 'talking',
  THINKING: 'thinking',
  LISTENING: 'listening',
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

export class AvatarController {
  constructor() {
    this.state = AVATAR_STATES.IDLE;
    this.time = 0;

    // Blink
    this.blinkValue = 0; // 0 = eyes open, 1 = eyes closed
    this.nextBlinkAt = this._randomBlinkDelay();
    this.blinkPhase = 'idle'; // 'idle' | 'closing' | 'opening'
    this.blinkProgress = 0;

    // Breathing
    this.breatheValue = 0; // -1..1

    // Mouth / talking
    this.mouthOpen = 0; // 0..1 (current, smoothed)
    this.mouthTarget = 0;
    this.nextMouthChangeAt = 0;

    // Head movement
    this.headRotation = { x: 0, y: 0, z: 0 };
    this.headTargetOffset = { x: 0, y: 0 };
    this.nextHeadShiftAt = this._randomRange(2, 4);

    // Float
    this.floatOffset = 0;

    // Thinking
    this.thinkLookUp = 0; // 0..1 smoothed toward target

    // Listening
    this.listenPulse = 0;
  }

  setState(nextState) {
    if (!Object.values(AVATAR_STATES).includes(nextState)) return;
    if (this.state === nextState) return;
    this.state = nextState;

    if (nextState !== AVATAR_STATES.TALKING) {
      this.mouthTarget = 0;
    }
  }

  getState() {
    return this.state;
  }

  _randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  _randomBlinkDelay() {
    return this._randomRange(2.5, 6);
  }

  _updateBlink(dt) {
    if (this.blinkPhase === 'idle') {
      this.nextBlinkAt -= dt;
      if (this.nextBlinkAt <= 0) {
        this.blinkPhase = 'closing';
        this.blinkProgress = 0;
      }
    } else if (this.blinkPhase === 'closing') {
      this.blinkProgress += dt / 0.08; // 80ms to close
      this.blinkValue = clamp(this.blinkProgress, 0, 1);
      if (this.blinkProgress >= 1) {
        this.blinkPhase = 'opening';
        this.blinkProgress = 0;
      }
    } else if (this.blinkPhase === 'opening') {
      this.blinkProgress += dt / 0.12; // 120ms to open
      this.blinkValue = clamp(1 - this.blinkProgress, 0, 1);
      if (this.blinkProgress >= 1) {
        this.blinkPhase = 'idle';
        this.blinkValue = 0;
        this.nextBlinkAt = this._randomBlinkDelay();
      }
    }
  }

  _updateBreathing(dt) {
    // Slow sine wave, always running regardless of state
    this.breatheValue = Math.sin(this.time * 1.1);
  }

  _updateFloat(dt) {
    this.floatOffset = Math.sin(this.time * 0.8) * 0.02;
  }

  _updateMouth(dt) {
    if (this.state === AVATAR_STATES.TALKING) {
      this.nextMouthChangeAt -= dt;
      if (this.nextMouthChangeAt <= 0) {
        // Randomized chatter effect — fakes phoneme movement without lip sync
        this.mouthTarget = this._randomRange(0.15, 0.85);
        this.nextMouthChangeAt = this._randomRange(0.06, 0.16);
      }
    } else {
      this.mouthTarget = 0;
    }
    // Smooth toward target for natural motion
    this.mouthOpen = lerp(this.mouthOpen, this.mouthTarget, clamp(dt * 14, 0, 1));
  }

  _updateHead(dt) {
    this.nextHeadShiftAt -= dt;
    if (this.nextHeadShiftAt <= 0) {
      if (this.state === AVATAR_STATES.TALKING) {
        this.headTargetOffset = {
          x: this._randomRange(-0.05, 0.05),
          y: this._randomRange(-0.06, 0.06),
        };
        this.nextHeadShiftAt = this._randomRange(0.8, 1.6);
      } else {
        this.headTargetOffset = {
          x: this._randomRange(-0.025, 0.025),
          y: this._randomRange(-0.03, 0.03),
        };
        this.nextHeadShiftAt = this._randomRange(2, 4);
      }
    }

    const thinkTarget = this.state === AVATAR_STATES.THINKING ? 1 : 0;
    this.thinkLookUp = lerp(this.thinkLookUp, thinkTarget, clamp(dt * 3, 0, 1));

    const targetX = this.headTargetOffset.x - this.thinkLookUp * 0.18;
    const targetY = this.headTargetOffset.y;

    this.headRotation.x = lerp(this.headRotation.x, targetX, clamp(dt * 3, 0, 1));
    this.headRotation.y = lerp(this.headRotation.y, targetY, clamp(dt * 3, 0, 1));
    this.headRotation.z = Math.sin(this.time * 0.6) * 0.01;
  }

  _updateListening(dt) {
    const target = this.state === AVATAR_STATES.LISTENING ? 1 : 0;
    this.listenPulse = lerp(this.listenPulse, target, clamp(dt * 4, 0, 1));
  }

  update(dt) {
    // Clamp dt to avoid huge jumps on tab-switch / frame drops
    const safeDt = clamp(dt, 0, 0.1);
    this.time += safeDt;

    this._updateBlink(safeDt);
    this._updateBreathing(safeDt);
    this._updateFloat(safeDt);
    this._updateMouth(safeDt);
    this._updateHead(safeDt);
    this._updateListening(safeDt);

    return this.getAnimationValues();
  }

  getAnimationValues() {
    return {
      state: this.state,
      blink: this.blinkValue,
      breathe: this.breatheValue,
      mouthOpen: this.mouthOpen,
      headRotation: { ...this.headRotation },
      floatOffset: this.floatOffset,
      thinkLookUp: this.thinkLookUp,
      listenPulse: this.listenPulse,
    };
  }
}
