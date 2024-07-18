export const RefsHelper = {
  
  // Récupère un élément par ref avec fallback getElementById
  get(refName) {
    const { getRef } = window.BrowserRouter || {};
    return getRef ? getRef(refName) : document.getElementById(refName);
  },

  // Récupère plusieurs éléments par refs
  getMultiple(...refNames) {
    const result = {};
    for (const refName of refNames) {
      result[refName] = this.get(refName);
    }
    return result;
  },

  // Vérifie si une ref existe
  exists(refName) {
    return this.get(refName) !== null;
  },

  // Récupère la valeur d'un input par ref
  getValue(refName) {
    const element = this.get(refName);
    return element?.value || '';
  },

  // Met à jour la valeur d'un input par ref
  setValue(refName, value) {
    const element = this.get(refName);
    if (element) {
      element.value = value;
    }
  },

  // Récupère plusieurs valeurs d'inputs par refs
  getFormData(...refNames) {
    const result = {};
    for (const refName of refNames) {
      result[refName] = this.getValue(refName);
    }
    return result;
  },

  // Met à jour plusieurs valeurs d'inputs par refs
  focus(refName) {
    const element = this.get(refName);
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  // Définit l'état disabled d'un élément par ref
  setDisabled(refName, disabled) {
    const element = this.get(refName);
    if (element) {
      element.disabled = disabled;
    }
  },

  // Met à jour le texte d'un élément par ref
  setText(refName, text) {
    const element = this.get(refName);
    if (element) {
      element.textContent = text;
    }
  },

  // Met à jour plusieurs styles d'un élément par ref
  setStyles(refName, styles) {
    const element = this.get(refName);
    if (element) {
      Object.assign(element.style, styles);
    }
  },

  // Met à jour plusieurs valeurs d'inputs par refs
  toggleClass(refName, className, add = true) {
    const element = this.get(refName);
    if (element) {
      element.classList.toggle(className, add);
    }
  }
};


export const FormHelper = {
  
// Collecte toutes les données d'un formulaire par refs
  collectData(fieldMap) {
    const data = {};
    for (const [refName, fieldName] of Object.entries(fieldMap)) {
      data[fieldName] = RefsHelper.getValue(refName);
    }
    return data;
  },

// Valide un formulaire avec des règles simples
  validate(rules) {
    const errors = [];
    let isValid = true;

    for (const [refName, rule] of Object.entries(rules)) {
      const value = RefsHelper.getValue(refName);
      
      if (rule.required && !value.trim()) {
        errors.push(`Le champ ${refName} est requis`);
        isValid = false;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`Le champ ${refName} doit contenir au moins ${rule.minLength} caractères`);
        isValid = false;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`Le champ ${refName} ne peut pas dépasser ${rule.maxLength} caractères`);
        isValid = false;
      }
    }

    return { isValid, errors };
  },

  // Réinitialise les valeurs d'un formulaire
  reset(...refNames) {
    for (const refName of refNames) {
      RefsHelper.setValue(refName, '');
    }
  },

  // Met en évidence les champs avec erreurs
  highlightErrors(errorFields) {
    for (const refName of errorFields) {
      RefsHelper.setStyles(refName, {
        borderColor: '#f44336',
        boxShadow: '0 0 0 2px rgba(244, 67, 54, 0.2)'
      });
    }
  },

// Retire la mise en évidence des erreurs
  clearErrorHighlight(...refNames) {
    for (const refName of refNames) {
      RefsHelper.setStyles(refName, {
        borderColor: '#ddd',
        boxShadow: 'none'
      });
    }
  }
};

// Helper pour les états de chargement
export const LoadingHelper = {
  // Met un bouton en état de chargement
  setButtonLoading(refName, loading, loadingText = '⏳ Chargement...', normalText = null) {
    const button = RefsHelper.get(refName);
    if (!button) return;

    if (loading) {
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.textContent = loadingText;
      button.disabled = true;
      RefsHelper.setStyles(refName, { opacity: '0.7', cursor: 'not-allowed' });
    } else {
      button.textContent = normalText || button.dataset.originalText || button.textContent;
      button.disabled = false;
      RefsHelper.setStyles(refName, { opacity: '1', cursor: 'pointer' });
      delete button.dataset.originalText;
    }
  },

  // Met un élément en état de chargement
  setLoadingVisible(refName, visible) {
    RefsHelper.setStyles(refName, {
      display: visible ? 'block' : 'none'
    });
  }
};

// Raccourcis
export const $ = RefsHelper.get.bind(RefsHelper);
export const $$ = RefsHelper.getMultiple.bind(RefsHelper);
export const $val = RefsHelper.getValue.bind(RefsHelper);
export const $text = RefsHelper.setText.bind(RefsHelper);

// Export par défaut pour commodité
export default {
  RefsHelper,
  FormHelper,
  LoadingHelper,
  $, $$, $val, $text
};
