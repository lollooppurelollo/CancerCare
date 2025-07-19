import { useEffect, useRef } from 'react';

export function useKeyboardVisibility() {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let timeout: NodeJS.Timeout;

    const handleFocus = () => {
      // Delay to ensure the keyboard is shown
      timeout = setTimeout(() => {
        // Calculate the position to scroll to
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Assume keyboard takes about 40% of screen height on mobile
        const keyboardHeight = viewportHeight * 0.4;
        const availableHeight = viewportHeight - keyboardHeight;
        
        // Position the element in the upper part of the available space
        const targetPosition = rect.top + window.scrollY - (availableHeight * 0.2);
        
        // Smooth scroll to position
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
      }, 300); // Wait for keyboard animation
    };

    const handleBlur = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };

    // Add focus and blur event listeners
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Also handle touch events for better mobile support
    element.addEventListener('touchstart', handleFocus);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('touchstart', handleFocus);
    };
  }, []);

  return elementRef;
}