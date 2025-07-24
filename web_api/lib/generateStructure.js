export default async function generateStructure(structure) {
  if (typeof structure.tag === "function") {
    const props = Object.fromEntries(structure.attributes ?? []);
    const result = await structure.tag(props);
    if (result && typeof result === 'object' && result.tag) {
      return await generateStructure(result);
    }
    return result;
  }
  
  if (!structure.tag) {
    console.error("Invalid structure:", structure);
    return document.createTextNode("");
  }
  
  const elem = document.createElement(structure.tag);
  
  
  if (structure.attributes) {
    const styleProps = {};
    const otherAttrs = [];
    
    for (let attribute of structure.attributes) {
      const attrName = attribute[0];
      const attrValue = attribute[1];
      
      if (attrName === "style") {
        Object.assign(styleProps, attrValue);
      } else if (attrName === "class") {
        elem.className = attrValue;
      } else if (attrName === "href") {
        elem.setAttribute(attrName, attrValue);
      } else {
        otherAttrs.push([attrName, attrValue]);
      }
    }
    
    
    if (Object.keys(styleProps).length > 0) {
      Object.assign(elem.style, styleProps);
    }
    
    
    for (let [attrName, attrValue] of otherAttrs) {
      elem.setAttribute(attrName, attrValue);
    }
  }
  
  
  if (structure.events) {
    for (let eventName in structure.events) {
      for (let listener of structure.events[eventName]) {
        elem.addEventListener(eventName, listener);
      }
    }
  } 
  
  
  if (structure.children) {
    for (let child of structure.children) {
      const childElem =
        typeof child === "string"
          ? document.createTextNode(child)
          : await generateStructure(child);
      if (childElem) {
        elem.appendChild(childElem);
      }
    }
  }
  
  // Appeler postRender si la fonction existe sur le composant
  if (structure.tag && structure.tag.postRender && typeof structure.tag.postRender === 'function') {
    // Utiliser setTimeout pour s'assurer que le DOM est complètement rendu
    setTimeout(() => {
      structure.tag.postRender();
    }, 0);
  }
  
  return elem;
}
