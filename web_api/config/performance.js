// Configuration des optimisations de performance

export const PERFORMANCE_CONFIG = {
  // Cache des pages
  pageCache: {
    maxSize: 10,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  
  // Lazy loading
  lazyLoading: {
    threshold: 0.1,
    rootMargin: '50px',
    delay: 100,
  },
  
  // Transitions
  transitions: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Images
  images: {
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3C/svg%3E',
    preloadCount: 5,
  },
  
  // Debounce
  debounce: {
    scroll: 16, // ~60fps
    resize: 100,
    input: 300,
  },
  
  // Throttle
  throttle: {
    scroll: 16,
    resize: 100,
  },
  
  // Intersection Observer
  intersectionObserver: {
    threshold: 0.1,
    rootMargin: '50px',
  },
};

// Fonction pour vérifier si l'appareil a des performances limitées
export function isLowPerformanceDevice() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.downlink < 1;
  }
  
  // Fallback basé sur la mémoire
  if (navigator.deviceMemory) {
    return navigator.deviceMemory < 4;
  }
  
  return false;
}

// Fonction pour ajuster les optimisations selon l'appareil
export function getOptimizedConfig() {
  const isLowPerf = isLowPerformanceDevice();
  
  if (isLowPerf) {
    return {
      ...PERFORMANCE_CONFIG,
      lazyLoading: {
        ...PERFORMANCE_CONFIG.lazyLoading,
        threshold: 0.5,
        rootMargin: '100px',
      },
      transitions: {
        ...PERFORMANCE_CONFIG.transitions,
        duration: 150,
      },
      images: {
        ...PERFORMANCE_CONFIG.images,
        preloadCount: 2,
      },
    };
  }
  
  return PERFORMANCE_CONFIG;
}

// Fonction pour précharger les ressources critiques
export function preloadCriticalResources() {
  const criticalPaths = [
    '/web_api/home',
    '/web_api/profile',
  ];
  
  // Précharger les routes critiques
  criticalPaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  });
}

// Fonction pour optimiser le scroll
export function optimizeScroll() {
  let ticking = false;
  
  function updateScroll() {
    // Optimisations de scroll si nécessaire
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick, { passive: true });
}

// Fonction pour nettoyer les ressources
export function cleanupResources() {
  // Nettoyer les caches si nécessaire
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.startsWith('meetup-connect-')) {
          caches.delete(name);
        }
      });
    });
  }
} 