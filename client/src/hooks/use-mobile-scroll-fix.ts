import { useEffect, useRef } from 'react';

/**
 * Aggressivo hook di scroll per dispositivi mobili che assicura 
 * che i campi di testo rimangano visibili quando appare la tastiera
 */
export function useMobileScrollFix<T extends HTMLElement = HTMLElement>() {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Detect mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|Mobile/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && 'ontouchstart' in window);

    if (!isMobile) return;

    let timeouts: NodeJS.Timeout[] = [];

    const performScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Keyboard is likely visible if viewport is significantly reduced
      const isKeyboardVisible = viewportHeight < window.screen.height * 0.75;
      
      if (!isKeyboardVisible) return;
      
      // Target: position field at 30% from top of visible viewport
      const targetPosition = viewportHeight * 0.3;
      const currentTop = rect.top;
      
      // Calculate required scroll
      const scrollNeeded = currentTop - targetPosition;
      const newScrollY = window.pageYOffset + scrollNeeded;
      
      console.log(`📱 Mobile scroll fix: viewport=${viewportHeight}, target=${targetPosition}, scrollTo=${newScrollY}`);
      
      // Scroll to position
      window.scrollTo({
        top: Math.max(0, newScrollY),
        behavior: 'smooth'
      });
    };

    const handleFocusIn = () => {
      console.log('📱 Focus detected - scheduling scroll sequence');
      
      // Clear any existing timeouts
      timeouts.forEach(clearTimeout);
      timeouts = [];
      
      // Schedule multiple scroll attempts with different delays
      const delays = [50, 200, 400, 600, 800, 1000, 1500];
      
      delays.forEach(delay => {
        const timeout = setTimeout(performScroll, delay);
        timeouts.push(timeout);
      });
    };

    const handleInput = () => {
      // Additional scroll on input to handle edge cases
      if (document.activeElement === element) {
        const timeout = setTimeout(performScroll, 100);
        timeouts.push(timeout);
      }
    };

    const handleTouchStart = () => {
      // Trigger on touch for better mobile responsiveness
      const timeout = setTimeout(handleFocusIn, 50);
      timeouts.push(timeout);
    };

    // Add event listeners
    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focus', handleFocusIn);
    element.addEventListener('input', handleInput);
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('click', handleFocusIn);

    // Visual Viewport API for modern browsers
    if ('visualViewport' in window) {
      const handleViewportChange = () => {
        if (document.activeElement === element || element.contains(document.activeElement)) {
          const timeout = setTimeout(performScroll, 100);
          timeouts.push(timeout);
        }
      };
      
      window.visualViewport?.addEventListener('resize', handleViewportChange);
      
      return () => {
        timeouts.forEach(clearTimeout);
        element.removeEventListener('focusin', handleFocusIn);
        element.removeEventListener('focus', handleFocusIn);
        element.removeEventListener('input', handleInput);
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('click', handleFocusIn);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }

    // Cleanup for browsers without visual viewport
    return () => {
      timeouts.forEach(clearTimeout);
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focus', handleFocusIn);
      element.removeEventListener('input', handleInput);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('click', handleFocusIn);
    };
  }, []);

  return elementRef;
}