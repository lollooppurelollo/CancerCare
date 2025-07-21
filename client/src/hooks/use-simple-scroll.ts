import { useEffect, useRef } from 'react';

/**
 * Hook semplicissimo per scroll automatico su mobile
 * Test diretto senza complessità
 */
export function useSimpleScroll() {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    // Rilevamento mobile semplice
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    console.log('🚀 Simple scroll hook attached to:', element.tagName);

    const scrollToElement = () => {
      console.log('🚀 SCROLLING NOW!');
      
      // Ottieni posizione elemento
      const rect = element.getBoundingClientRect();
      console.log('🚀 Element rect:', rect.top, rect.bottom);
      
      // Calcola scroll necessario
      const viewportHeight = window.innerHeight;
      const targetTop = viewportHeight * 0.2; // 20% dall'alto
      const scrollNeeded = rect.top - targetTop;
      const newScrollY = window.pageYOffset + scrollNeeded;
      
      console.log('🚀 Viewport:', viewportHeight, 'ScrollTo:', newScrollY);
      
      // Scroll immediato
      window.scrollTo(0, Math.max(0, newScrollY));
      
      console.log('🚀 Scroll completed. New position:', window.pageYOffset);
    };

    const handleFocus = () => {
      console.log('🚀 FOCUS event detected!');
      // Scroll immediato + ritardati
      setTimeout(scrollToElement, 50);
      setTimeout(scrollToElement, 200);
      setTimeout(scrollToElement, 500);
      setTimeout(scrollToElement, 1000);
    };

    const handleClick = () => {
      console.log('🚀 CLICK event detected!');
      setTimeout(scrollToElement, 100);
      setTimeout(scrollToElement, 300);
    };

    const handleTouchStart = () => {
      console.log('🚀 TOUCH event detected!');
      setTimeout(scrollToElement, 150);
      setTimeout(scrollToElement, 400);
    };

    // Eventi semplici
    element.addEventListener('focus', handleFocus);
    element.addEventListener('click', handleClick);
    element.addEventListener('touchstart', handleTouchStart);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('click', handleClick);
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return inputRef;
}