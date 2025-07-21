/**
 * Utility per scroll automatico su mobile - approccio diretto senza hook
 */

export function addMobileScrollSupport(element: HTMLElement) {
  // Rilevamento mobile
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (!isMobile) return () => {};

  console.log('📲 Adding mobile scroll support to:', element.tagName);

  const scrollToElement = () => {
    console.log('📲 Scrolling to element...');
    
    try {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Se l'elemento è sotto il 40% dello schermo, scrolliamo
      if (rect.top > viewportHeight * 0.4) {
        const targetY = window.pageYOffset + rect.top - (viewportHeight * 0.25);
        window.scrollTo(0, Math.max(0, targetY));
        console.log('📲 Scrolled to position:', Math.max(0, targetY));
      }
    } catch (error) {
      console.error('📲 Scroll error:', error);
    }
  };

  const handleInteraction = (event: Event) => {
    console.log('📲 Interaction detected:', event.type);
    
    // Scroll immediato
    setTimeout(scrollToElement, 50);
    // Scroll ritardato per tastiera lenta
    setTimeout(scrollToElement, 300);
    setTimeout(scrollToElement, 600);
    setTimeout(scrollToElement, 1000);
  };

  // Aggiungi event listeners
  element.addEventListener('focus', handleInteraction);
  element.addEventListener('click', handleInteraction);
  element.addEventListener('touchstart', handleInteraction);
  element.addEventListener('input', handleInteraction);

  // Return cleanup function
  return () => {
    element.removeEventListener('focus', handleInteraction);
    element.removeEventListener('click', handleInteraction);
    element.removeEventListener('touchstart', handleInteraction);
    element.removeEventListener('input', handleInteraction);
  };
}