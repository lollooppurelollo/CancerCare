import { useEffect, useRef } from 'react';

interface UseSmartScrollOptions {
  submitButtonSelector?: string;
  containerSelector?: string;
  offsetFromTop?: number;
}

export function useSmartScroll<T extends HTMLElement = HTMLElement>(options: UseSmartScrollOptions = {}) {
  const elementRef = useRef<T>(null);
  
  const {
    submitButtonSelector = 'button[type="submit"], button:has([class*="save"]), button:has([class*="invia"]), button:has([class*="Salva"]), button:has([class*="Invia"])',
    containerSelector = '',
    offsetFromTop = 120
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;
    let resizeTimeout: NodeJS.Timeout;
    
    // Enhanced mobile detection
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|Mobile/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && 'ontouchstart' in window);

    const smartScroll = () => {
      if (!isMobile) return;
      
      console.log('📱 Smart scroll activated for text field');
      
      // Get current element position
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Estimate keyboard height (typically 40-50% of viewport on mobile)
      const estimatedKeyboardHeight = viewportHeight * 0.45;
      const availableViewport = viewportHeight - estimatedKeyboardHeight;
      
      // Target position: place field in upper third of available viewport
      const targetFromTop = availableViewport * 0.3;
      
      // Calculate scroll needed
      const currentScrollY = window.pageYOffset;
      const elementTopRelativeToDocument = elementRect.top + currentScrollY;
      const targetScrollY = elementTopRelativeToDocument - targetFromTop;
      
      console.log(`📱 Element top: ${elementRect.top}, Target scroll: ${targetScrollY}, Available viewport: ${availableViewport}`);
      
      // Perform scroll
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth'
      });
    };

    const handleFocus = () => {
      if (!isMobile) return;
      
      console.log('📱 Text field focused - initiating smart scroll');
      
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Multiple delayed scrolls to handle different keyboard appearance timings
      setTimeout(smartScroll, 100);   // Quick initial scroll
      setTimeout(smartScroll, 300);   // iOS standard delay
      setTimeout(smartScroll, 500);   // Android delay
      setTimeout(smartScroll, 800);   // Slow keyboards
      setTimeout(smartScroll, 1200);  // Very slow keyboards
    };

    const handleResize = () => {
      if (!isMobile) return;
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      // Re-scroll if element is still focused after viewport change (keyboard appearing/disappearing)
      if (document.activeElement === element) {
        resizeTimeout = setTimeout(() => {
          console.log('📱 Viewport changed while focused - re-adjusting scroll');
          smartScroll();
          // Additional scrolls for stubborn cases
          setTimeout(smartScroll, 200);
          setTimeout(smartScroll, 500);
        }, 100);
      }
    };

    const handleClick = () => {
      if (!isMobile) return;
      // Delay for click to register, then trigger scroll sequence
      setTimeout(() => {
        console.log('📱 Element clicked - triggering scroll');
        setTimeout(smartScroll, 50);
        setTimeout(smartScroll, 200);
        setTimeout(smartScroll, 400);
      }, 50);
    };

    // Enhanced event listeners for better mobile support
    element.addEventListener('focus', handleFocus);
    element.addEventListener('click', handleClick);
    element.addEventListener('touchstart', handleClick);
    element.addEventListener('touchend', handleClick);
    element.addEventListener('input', () => {
      // Scroll on input to handle cases where focus doesn't trigger
      if (document.activeElement === element) {
        setTimeout(smartScroll, 100);
      }
    });
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 200);
    });
    
    // Additional mobile-specific events
    window.addEventListener('scroll', () => {
      // Prevent browser auto-scroll from interfering
      if (document.activeElement === element) {
        setTimeout(smartScroll, 50);
      }
    }, { passive: true });
    
    // Visual viewport API for better keyboard detection on modern browsers
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport!;
      const handleViewportChange = () => {
        if (document.activeElement === element) {
          console.log('📱 Visual viewport changed - adjusting scroll');
          setTimeout(smartScroll, 100);
          setTimeout(smartScroll, 300);
        }
      };
      
      visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        if (resizeTimeout) clearTimeout(resizeTimeout);
        
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('click', handleClick);
        element.removeEventListener('touchstart', handleClick);
        element.removeEventListener('touchend', handleClick);
        window.removeEventListener('resize', handleResize);
        visualViewport.removeEventListener('resize', handleViewportChange);
      };
    }

    // Fallback cleanup for browsers without visual viewport
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('click', handleClick);
      element.removeEventListener('touchstart', handleClick);
      element.removeEventListener('touchend', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [submitButtonSelector, containerSelector, offsetFromTop]);

  return elementRef;
}