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
      
      // Find the form container or custom container  
      const findContainer = (el: T): HTMLElement => {
        if (containerSelector) {
          const customContainer = document.querySelector(containerSelector) as HTMLElement;
          if (customContainer) return customContainer;
        }
        
        // Look for form or parent with submit buttons
        let current = el.parentElement;
        while (current && current !== document.body) {
          if (current.tagName === 'FORM' || 
              current.querySelector(submitButtonSelector)) {
            return current;
          }
          current = current.parentElement;
        }
        return el;
      };

      const container = findContainer(element);
      const submitButton = container.querySelector(submitButtonSelector) as HTMLElement;
      
      // Calculate visible viewport (excluding keyboard)
      const originalHeight = window.screen.height;
      const currentHeight = window.innerHeight;
      const keyboardHeight = Math.max(0, originalHeight - currentHeight - 100);
      const availableHeight = currentHeight - Math.max(keyboardHeight * 0.1, 50);
      
      // Get positions
      const elementRect = element.getBoundingClientRect();
      const submitRect = submitButton?.getBoundingClientRect();
      
      // Calculate required space
      const fieldHeight = elementRect.height;
      const buttonHeight = submitRect?.height || 40;
      const totalNeededHeight = fieldHeight + buttonHeight + 60; // 60px padding
      
      // Determine scroll position
      let targetY;
      
      if (totalNeededHeight <= availableHeight) {
        // Both field and button can fit - center them in available space
        const centerPosition = availableHeight / 2 - totalNeededHeight / 2;
        targetY = window.pageYOffset + elementRect.top - centerPosition;
      } else {
        // Prioritize field visibility at top with some padding
        targetY = window.pageYOffset + elementRect.top - offsetFromTop;
      }
      
      // Smooth scroll to calculated position
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth'
      });
      
      console.log(`📱 Scrolled to position: ${targetY}, available height: ${availableHeight}`);
    };

    const handleFocus = () => {
      if (!isMobile) return;
      
      console.log('📱 Text field focused - initiating smart scroll');
      
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // Immediate scroll
      smartScroll();
      
      // Delayed scrolls for keyboard appearance
      scrollTimeout = setTimeout(smartScroll, 300);
      setTimeout(smartScroll, 600);
      setTimeout(smartScroll, 900);
    };

    const handleResize = () => {
      if (!isMobile) return;
      
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      // Re-scroll if element is still focused after viewport change
      if (document.activeElement === element) {
        resizeTimeout = setTimeout(() => {
          console.log('📱 Viewport changed while focused - re-adjusting scroll');
          smartScroll();
        }, 150);
      }
    };

    const handleClick = () => {
      if (!isMobile) return;
      // Slight delay for click to register before scrolling
      setTimeout(handleFocus, 50);
    };

    // Event listeners
    element.addEventListener('focus', handleFocus);
    element.addEventListener('click', handleClick);
    element.addEventListener('touchstart', handleClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 200);
    });

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('click', handleClick);
      element.removeEventListener('touchstart', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [submitButtonSelector, containerSelector, offsetFromTop]);

  return elementRef;
}