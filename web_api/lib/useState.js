let globalState = new Map(); 
let componentMetadata = new Map(); 
let currentComponentId = null;
let stateIndex = 0;
let componentInstances = new Map(); 
let pendingRegistrations = new Set(); 


function generateComponentId() {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


function registerPendingComponents() {
  for (let componentId of pendingRegistrations) {
    const domElements = document.querySelectorAll(`[data-component-id="${componentId}"]`);
    if (domElements.length > 0) {
      componentInstances.set(componentId, domElements[0]);
      pendingRegistrations.delete(componentId);
    }
  }
}


setInterval(registerPendingComponents, 100);


export function useState(initialValue) {
  if (!currentComponentId) {
    throw new Error('useState doit être appelé dans un composant');
  }

  const componentState = globalState.get(currentComponentId) || {};
  const currentIndex = stateIndex++;
  
  
  if (!(currentIndex in componentState)) {
    componentState[currentIndex] = initialValue;
    globalState.set(currentComponentId, componentState);
  }

  
  const setState = (function(componentId, stateIndex) {
    return function(newValue) {
      const componentState = globalState.get(componentId) || {};
      
      
      if (typeof newValue === 'function') {
        newValue = newValue(componentState[stateIndex]);
      }
      
      
      if (componentState[stateIndex] !== newValue) {
        componentState[stateIndex] = newValue;
        globalState.set(componentId, componentState);
        
        
        triggerReRender(componentId);
      }
    };
  })(currentComponentId, currentIndex);

  return [componentState[currentIndex], setState];
}


export function createComponent(componentFunction) {
  return function(props) {
    
    const componentId = generateComponentId();
    const previousComponentId = currentComponentId;
    
    try {
      currentComponentId = componentId;
      stateIndex = 0; 
      
      
      const result = componentFunction(props);
      
        
      componentMetadata.set(componentId, {
        componentFunction: componentFunction,
        props,
        element: result
      });
      
      
      if (result && result.attributes) {
        result.attributes.push(['data-component-id', componentId]);
      }
      
      
      pendingRegistrations.add(componentId);
      
      return result;
    } finally {
      currentComponentId = previousComponentId;
    }
  };
}


function triggerReRender(componentId) {
  const componentData = componentMetadata.get(componentId);
  
  if (componentData && componentData.componentFunction) {
    
    
    const previousComponentId = currentComponentId;
    const previousStateIndex = stateIndex;
    
    try {
      currentComponentId = componentId;
      stateIndex = 0; 
      
      
      const newResult = componentData.componentFunction(componentData.props);
      
      
      if (newResult && newResult.attributes) {
        newResult.attributes.push(['data-component-id', componentId]);
      }
      
      
      import('./generateStructure.js').then(({ default: generateStructure }) => {
        const newDomNode = generateStructure(newResult);
        
        
        const oldDomNode = componentInstances.get(componentId);
        
        
        if (oldDomNode && oldDomNode.parentNode) {
          try {
            oldDomNode.parentNode.replaceChild(newDomNode, oldDomNode);
            componentInstances.set(componentId, newDomNode);
          } catch (error) {
            console.error('Error replacing DOM node:', error);
          }
        } else {
          
          pendingRegistrations.add(componentId);
        }
        
        
        componentData.element = newResult;
        componentMetadata.set(componentId, componentData);
      }).catch(error => {
        console.error('Error in triggerReRender:', error);
      });
    } finally {
      
      currentComponentId = previousComponentId;
      stateIndex = previousStateIndex;
    }
  }
}


export function cleanupComponent(componentId) {
  globalState.delete(componentId);
  componentMetadata.delete(componentId);
  componentInstances.delete(componentId);
  pendingRegistrations.delete(componentId);
}


export function getGlobalState() {
  return globalState;
}


export function resetGlobalState() {
  globalState.clear();
  componentMetadata.clear();
  componentInstances.clear();
  pendingRegistrations.clear();
  currentComponentId = null;
  stateIndex = 0;
} 