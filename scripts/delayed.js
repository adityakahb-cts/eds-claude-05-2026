import Lenis from './vendor/lenis-1.3.23.js';

const lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true });

/**
 * Runs the Lenis smooth-scroll animation frame loop.
 * @param {number} time Current timestamp from requestAnimationFrame
 */
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
