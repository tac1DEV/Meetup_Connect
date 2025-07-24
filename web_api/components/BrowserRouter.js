import generateStructure from "../lib/generateStructure.js";

const browserRouterOptions = {};
const pageCache = new Map(); // Cache pour les pages générées

export default function BrowserRouter(props) {
  const routes = props.routes;
  const rootElement = props.rootElement;
  const baseUrl = props.baseUrl ?? "";
  browserRouterOptions.baseUrl = baseUrl;
  
  function generatePage() {
    const path = window.location.pathname.slice(baseUrl.length);
    const struct = routes[path] ?? routes["*"];
    
    // Vérifier si nous sommes déjà sur la bonne page
    const currentPath = rootElement.getAttribute('data-current-path');
    if (currentPath === path) return;
    
    // Vérifier le cache
    let page = pageCache.get(path);
    if (!page) {
      page = generateStructure(struct);
      if (page) {
        pageCache.set(path, page);
      }
    }
    
    if (!page) {
      console.error("Failed to generate page for path:", path);
      return;
    }
    
    // Optimisation : transition fluide avec fade
    if (rootElement.childNodes.length === 0) {
      rootElement.appendChild(page);
    } else {
      const oldPage = rootElement.childNodes[0];
      
      // Ajouter la nouvelle page avec fade-in
      page.style.opacity = '0';
      page.style.transform = 'translateX(20px)';
      page.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      rootElement.insertBefore(page, oldPage);
      
      // Animer l'ancienne page vers la sortie
      oldPage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      oldPage.style.opacity = '0';
      oldPage.style.transform = 'translateX(-20px)';
      
      // Animer la nouvelle page vers l'entrée
      requestAnimationFrame(() => {
        page.style.opacity = '1';
        page.style.transform = 'translateX(0)';
      });
      
      // Supprimer l'ancienne page après l'animation
      setTimeout(() => {
        if (oldPage.parentNode) {
          rootElement.removeChild(oldPage);
        }
      }, 300);
    }
    
    rootElement.setAttribute('data-current-path', path);
    
    // Initialiser les optimisations spécifiques à la page
    initPageOptimizations(path);
  }
  
  function initPageOptimizations(path) {
    // Initialiser le lazy loading pour la galerie
    if (path === '/gallery') {
      setTimeout(() => {
        import('../views/GalleryPage.js').then(({ initGalleryLazyLoading }) => {
          initGalleryLazyLoading();
        }).catch(error => {
          console.log('Lazy loading déjà initialisé ou non disponible', error);
        });
      }, 100);
    }
    
    // Initialiser le panel admin
    if (path === '/admin') {
      setTimeout(() => {
        import('../views/AdminPage.js').then(({ default: AdminPage }) => {
          if (AdminPage.init) {
            AdminPage.init();
          }
        }).catch(error => {
          console.log('Admin page déjà initialisée ou non disponible', error);
        });
      }, 100);
    }
    
    // Vérifier le rôle admin pour afficher/masquer le lien dans le header
    setTimeout(() => {
      import('./Header.js').then(({ default: Header }) => {
        if (Header.checkAdminRole) {
          Header.checkAdminRole();
        }
      }).catch(error => {
        console.log('Header déjà initialisé ou non disponible', error);
      });
    }, 100);
  }

  window.addEventListener("popstate", generatePage);
  window.addEventListener("pushstate", generatePage);
  generatePage();
}

export function BrowserLink(props) {
  const link = props.link;
  const title = props.title;
  const style = props.style || {};

  return {
    tag: "a",
    attributes: [
      ["href", browserRouterOptions.baseUrl + link],
      ["style", {
        ...style,
        transition: "all 0.2s ease",
        willChange: "transform, opacity"
      }]
    ],
    events: {
      click: [
        function (event) {
          event.preventDefault();
          
          // Ajouter un indicateur de chargement
          const link = event.currentTarget;
          const originalText = link.textContent;
          link.textContent = "Chargement...";
          link.style.pointerEvents = "none";
          
          window.history.pushState(
            {},
            undefined,
            event.currentTarget.getAttribute("href")
          );
          window.dispatchEvent(new Event("pushstate"));
          
          // Restaurer le texte après un court délai
          setTimeout(() => {
            link.textContent = originalText;
            link.style.pointerEvents = "auto";
          }, 300);
        },
      ],
      mouseenter: [
        function (event) {
          const element = event.currentTarget;
          element.classList.add('hover');
          element.style.transform = 'translateY(-2px)';
        }
      ],
      mouseleave: [
        function (event) {
          const element = event.currentTarget;
          element.classList.remove('hover');
          element.style.transform = 'translateY(0)';
        }
      ]
    },
    children: [title],
  };
}
