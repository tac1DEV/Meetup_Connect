export const BindingHelpers = {
  // Mettre à jour le texte d'un élément
  text: (element, newValue) => {
    element.textContent = newValue;
  },

  // Mettre à jour le HTML d'un élément
  html: (element, newValue) => {
    element.innerHTML = newValue;
  },

  // Afficher/masquer un élément
  visible: (element, isVisible) => {
    element.style.display = isVisible ? '' : 'none';
  },

  // Activer/désactiver un élément
  disabled: (element, isDisabled) => {
    element.disabled = isDisabled;
  },

  // Gérer les classes CSS
  className: (element, className) => {
    element.className = className;
  },

  // Ajouter/retirer une classe
  toggleClass: (className) => (element, hasClass) => {
    element.classList.toggle(className, hasClass);
  },

  // Mettre à jour la valeur d'un input
  value: (element, newValue) => {
    element.value = newValue;
  },

  // Mettre à jour une source d'image
  imageSrc: (element, src) => {
    if (element.tagName.toLowerCase() === 'img') {
      element.src = src;
    } else {
      const img = element.querySelector('img');
      if (img) img.src = src;
    }
  },

  // Mettre à jour un attribut
  attribute: (attributeName) => (element, value) => {
    element.setAttribute(attributeName, value);
  },

  // Mettre à jour un style
  style: (styleName) => (element, value) => {
    element.style[styleName] = value;
  },

  // Gérer l'état de chargement
  loading: (element, isLoading) => {
    element.classList.toggle('loading', isLoading);
    if (isLoading) {
      element.setAttribute('aria-busy', 'true');
    } else {
      element.removeAttribute('aria-busy');
    }
  }
};

// Fonctions de convenance pour créer des éléments avec refs
export function createElementWithRef(tag, refId, attributes = [], children = []) {
  return {
    tag,
    ref: refId,
    attributes,
    children
  };
}

// Fonction pour créer un binding avec helpers prédéfinis
export function createBinding(stateKey, refId, helperName, ...args) {
  const helper = BindingHelpers[helperName];
  if (!helper) {
    throw new Error(`Helper de binding '${helperName}' non trouvé`);
  }

  const bindingFunction = args.length > 0 ? helper(...args) : helper;
  
  if (window.reactiveRenderer) {
    window.reactiveRenderer.bindState(stateKey, refId, bindingFunction);
  }
}

// Fonction pour créer plusieurs bindings facilement
export function createBindings(bindings) {
  bindings.forEach(({ stateKey, refId, helper, args = [] }) => {
    createBinding(stateKey, refId, helper, ...args);
  });
}

// Fonction pour mettre à jour un élément avec animation
export function animateElement(refId, updateFn, animationClass = 'fade-transition') {
  const element = window.reactiveRenderer?.getRef(refId);
  if (!element) return;

  element.classList.add(animationClass);
  
  requestAnimationFrame(() => {
    updateFn(element);
    
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, 300);
  });
}

// Fonction pour créer des composants réactifs
export function createReactiveComponent(componentName, stateKey, renderFn) {
  return (props = {}) => {
    const refId = `${componentName}-${Date.now()}-${Math.random()}`;
    
    // Créer l'élément de base
    const element = renderFn(props, refId);
    
    // Configurer le binding après création
    setTimeout(() => {
      if (window.reactiveRenderer) {
        window.reactiveRenderer.bindState(stateKey, refId, (el, newState) => {
          const newElement = renderFn({ ...props, state: newState }, refId);
          if (el.parentNode) {
            const generatedElement = window.generateStructure ? 
              window.generateStructure(newElement) : newElement;
            el.parentNode.replaceChild(generatedElement, el);
            window.reactiveRenderer.setRef(refId, generatedElement);
          }
        });
      }
    }, 0);
    
    return element;
  };
}
