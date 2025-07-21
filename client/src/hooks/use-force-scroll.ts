import { useEffect, useRef } from 'react';

/**
 * Hook semplice e diretto per forzare lo scroll su mobile
 * Approccio brutale ma efficace
 */
export function useForceScroll<T extends HTMLElement = HTMLElement>() {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Detect mobile
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isMobile) return;

    let scrollTimer: NodeJS.Timeout;

    const forceScroll = () => {
      try {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        console.log(`🔥 Current element position: ${rect.top}, viewport: ${viewportHeight}`);
        
        // Sempre scrolliamo se l'elemento è oltre il 30% dall'alto
        if (rect.top > viewportHeight * 0.3) {
          // Posiziona l'elemento al 20% dall'alto del viewport
          const targetY = window.pageYOffset + rect.top - (viewportHeight * 0.2);
          
          // Scroll brutale e immediato - NO smooth
          window.scrollTo(0, Math.max(0, targetY));
          
          console.log(`🔥 SCROLLED: from ${window.pageYOffset} to ${Math.max(0, targetY)}`);
        } else {
          console.log(`🔥 No scroll needed - element already visible`);
        }
      } catch (error) {
        console.error('🔥 Scroll error:', error);
      }
    };

    const handleAnyInteraction = (e: Event) => {
      console.log(`🔥 ${e.type.toUpperCase()} EVENT on ${element.tagName}!`);
      
      // Clear existing timer
      if (scrollTimer) clearTimeout(scrollTimer);
      
      // IMMEDIATE scroll
      forceScroll();
      
      // More aggressive follow-up scrolls
      setTimeout(forceScroll, 100);
      setTimeout(forceScroll, 300);
      setTimeout(forceScroll, 600);
      setTimeout(forceScroll, 1000);
      setTimeout(forceScroll, 1500);
      
      // Keep scrolling periodically while element is focused
      const keepScrolling = () => {
        if (document.activeElement === element) {
          console.log(`🔥 Keeping element in view...`);
          forceScroll();
          scrollTimer = setTimeout(keepScrolling, 500);
        }
      };
      
      scrollTimer = setTimeout(keepScrolling, 200);
    };

    // Add all possible event listeners
    const events = ['focus', 'focusin', 'click', 'touchstart', 'touchend', 'input', 'mousedown'];
    
    events.forEach(eventType => {
      element.addEventListener(eventType, handleAnyInteraction, { passive: true });
    });

    console.log(`🔥 Force scroll initialized for ${element.tagName}`);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      events.forEach(eventType => {
        element.removeEventListener(eventType, handleAnyInteraction);
      });
    };
  }, []);

  return elementRef;
}