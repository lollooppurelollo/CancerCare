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
      
      // Find the container with submit buttons (look for parent with buttons)
      const findSubmitContainer = (el: HTMLElement): HTMLElement | null => {
        let current = el.parentElement;
        while (current && current !== document.body) {
          const buttons = current.querySelectorAll('button[type="submit"], button:has([class*="save"]), button:has([class*="invia"])');
          if (buttons.length > 0) {
            return current;
          }
          current = current.parentElement;
        }
        return null;
      };

      const container = findSubmitContainer(element) || element;
      
      // Calculate keyboard height (approximate)
      const keyboardHeight = window.innerHeight * 0.4; // Assume keyboard takes 40% of screen
      const visibleHeight = window.innerHeight - keyboardHeight;
      
      // Scroll to show the field + submit button with padding
      const rect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // Position the field in upper half of visible area, leaving space for buttons below
      const targetPosition = visibleHeight * 0.25; // Show field at 25% from top of visible area
      const scrollY = window.pageYOffset + elementRect.top - targetPosition;
      
      window.scrollTo({
        top: Math.max(0, scrollY),
        behavior: 'smooth'
      });
      
      // Alternative method as fallback for stubborn cases
      setTimeout(() => {
        const newRect = element.getBoundingClientRect();
        if (newRect.top < 50 || newRect.top > visibleHeight * 0.5) {
          container.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 150);
    };

    const handleFocus = () => {
      if (!isMobile) return;
      
      console.log('🔧 Input focused - initiating scroll');
      
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Initial immediate scroll
      scrollToElement();
      
      // Secondary scroll after keyboard appears (iOS delay)
      scrollTimeout = setTimeout(() => {
        scrollToElement();
      }, 350);
      
      // Final scroll for stubborn keyboards (Android delay)
      setTimeout(() => {
        scrollToElement();
      }, 700);
      
      // Extra scroll for complex layouts
      setTimeout(() => {
        scrollToElement();
      }, 1000);
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