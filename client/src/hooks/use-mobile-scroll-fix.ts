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
      console.log('📱 Mobile scroll fix ACTIVATED');
      
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      console.log(`📱 Element position: top=${rect.top}, viewport=${viewportHeight}`);
      
      // Always scroll when this function is called - don't check keyboard visibility
      // Target: position field at 25% from top of viewport
      const targetPosition = viewportHeight * 0.25;
      const currentTop = rect.top;
      
      // Calculate required scroll
      const scrollNeeded = currentTop - targetPosition;
      const newScrollY = window.pageYOffset + scrollNeeded;
      const maxScroll = documentHeight - viewportHeight;
      const finalScrollY = Math.max(0, Math.min(newScrollY, maxScroll));
      
      console.log(`📱 Scrolling from ${window.pageYOffset} to ${finalScrollY}`);
      
      // Force scroll to position
      window.scrollTo({
        top: finalScrollY,
        behavior: 'smooth'
      });
      
      // Also try with instant scroll as backup
      setTimeout(() => {
        window.scrollTo(0, finalScrollY);
      }, 200);
    };

    const handleFocusIn = () => {
      console.log('📱 FOCUS DETECTED - starting aggressive scroll sequence');
      
      // Clear any existing timeouts
      timeouts.forEach(clearTimeout);
      timeouts = [];
      
      // Immediate scroll
      performScroll();
      
      // Schedule multiple scroll attempts with aggressive delays
      const delays = [100, 300, 500, 700, 1000, 1500, 2000];
      
      delays.forEach(delay => {
        const timeout = setTimeout(() => {
          console.log(`📱 Delayed scroll attempt at ${delay}ms`);
          performScroll();
        }, delay);
        timeouts.push(timeout);
      });
    };

    const handleInput = () => {
      console.log('📱 INPUT detected');
      if (document.activeElement === element) {
        performScroll();
        const timeout = setTimeout(performScroll, 200);
        timeouts.push(timeout);
      }
    };

    const handleTouchStart = () => {
      console.log('📱 TOUCH START detected');
      const timeout = setTimeout(() => {
        console.log('📱 Touch triggered focus sequence');
        handleFocusIn();
      }, 100);
      timeouts.push(timeout);
    };

    const handleClick = () => {
      console.log('📱 CLICK detected');
      const timeout = setTimeout(handleFocusIn, 150);
      timeouts.push(timeout);
    };

    // Add aggressive event listeners
    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focus', handleFocusIn);
    element.addEventListener('input', handleInput);
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchStart, { passive: true });
    element.addEventListener('click', handleClick);
    element.addEventListener('mousedown', handleClick);
    
    console.log('📱 Mobile scroll fix initialized for element:', element.tagName);

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
        element.removeEventListener('touchend', handleTouchStart);
        element.removeEventListener('click', handleClick);
        element.removeEventListener('mousedown', handleClick);
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
      element.removeEventListener('touchend', handleTouchStart);
      element.removeEventListener('click', handleClick);
      element.removeEventListener('mousedown', handleClick);
    };
  }, []);

  return elementRef;
}