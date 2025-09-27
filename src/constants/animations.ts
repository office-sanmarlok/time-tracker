/**
 * @file src/constants/animations.ts
 * @description Animation configurations for UI components
 * @purpose Define all animation settings for consistent motion design
 */

// Animation easings will be imported when needed in components
// Using standard easing values for now

/**
 * Animation configurations for different UI elements
 */
export const ANIMATIONS = {
  // Button press animation
  buttonPress: {
    scale: 0.95,
    duration: 100,
    easingType: 'out-quad'
  },

  // Active button pulsing border
  pulsingBorder: {
    minOpacity: 0.3,
    maxOpacity: 1.0,
    duration: 1500,
    easingType: 'inout-ease'
  },

  // Modal slide up animation
  modalSlideUp: {
    from: { translateY: 500 },
    to: { translateY: 0 },
    duration: 300,
    easingType: 'out-cubic'
  },

  // Modal backdrop fade
  modalBackdrop: {
    from: { opacity: 0 },
    to: { opacity: 0.5 },
    duration: 200,
    easingType: 'linear'
  },

  // Text scrolling for long names
  textScroll: {
    speed: 30,        // pixels per second
    delay: 2000,      // wait before scrolling starts
    gap: 40          // gap before repeat
  },

  // Chart segment transitions
  chartSegment: {
    duration: 400,
    easingType: 'out-cubic'
  },

  // Time indicator rotation
  timeIndicator: {
    duration: 1000,  // Update interval
    easingType: 'linear'
  },

  // Drag and drop
  dragDrop: {
    scale: 1.1,
    opacity: 0.8,
    duration: 150,
    easingType: 'out-quad'
  },

  // Button add/remove
  buttonAppear: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    duration: 250,
    easingType: 'out-back'
  },

  // Haptic feedback trigger points
  hapticTriggers: {
    longPressDelay: 400  // milliseconds before long press registers
  }
} as const;

/**
 * Spring animation configurations
 */
export const SPRING_CONFIG = {
  default: {
    damping: 15,
    stiffness: 100,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01
  },

  gentle: {
    damping: 20,
    stiffness: 80,
    mass: 1.2
  },

  bouncy: {
    damping: 10,
    stiffness: 150,
    mass: 0.8
  }
} as const;