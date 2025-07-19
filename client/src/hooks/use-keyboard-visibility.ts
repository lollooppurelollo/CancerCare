import { useEffect, useRef } from 'react';

export function useKeyboardVisibility() {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;
    let resizeTimeout: NodeJS.Timeout;
    
    // Detect mobile with more precise detection
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && 'ontouchstart' in window);

    const scrollToElement = () => {
      if (!isMobile) return;
      
      console.log('🔧 Scrolling element into view');
      
      // Use the native scrollIntoView API which is more reliable
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      
      // Alternative scroll method as fallback
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        if (rect.top < 100) { // If still not visible enough
          const targetY = rect.top + window.pageYOffset - 120;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
          });
        }
      }, 100);
    };

    const handleFocus = () => {
      if (!isMobile) return;
      
      console.log('🔧 Input focused - initiating scroll');
      
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Initial immediate scroll
      scrollToElement();
      
      // Secondary scroll after keyboard appears
      scrollTimeout = setTimeout(() => {
        scrollToElement();
      }, 300);
      
      // Final scroll for stubborn keyboards
      setTimeout(() => {
        scrollToElement();
      }, 600);
    };

    const handleResize = () => {
      if (!isMobile) return;
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      // If the element is currently focused and viewport changes (keyboard)
      if (document.activeElement === element) {
        resizeTimeout = setTimeout(() => {
          console.log('🔧 Viewport resized while focused - adjusting scroll');
          scrollToElement();
        }, 100);
      }
    };

    // Event listeners
    element.addEventListener('focus', handleFocus);
    element.addEventListener('touchstart', handleFocus); // For touch devices
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('touchstart', handleFocus);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return elementRef;
}