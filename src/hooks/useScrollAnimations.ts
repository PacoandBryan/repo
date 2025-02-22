import { useEffect } from 'react';

export const useScrollAnimations = () => {
  useEffect(() => {
    const isBigScreen = window.innerWidth >= 1024;
    
    // For screens that are not big, add class immediately (or skip animations)
    if (!isBigScreen) {
      document.querySelectorAll('[data-animate]').forEach((el) => {
        el.classList.add('is-visible');
      });
      return;
    }
    
    // For big screens, set up an IntersectionObserver
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all elements that have the attribute data-animate
    document.querySelectorAll('[data-animate]').forEach((element) => {
      observer.observe(element);
    });
    
    return () => {
      document.querySelectorAll('[data-animate]').forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);
}; 