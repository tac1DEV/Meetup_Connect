export default async function generateStructure(structure) {
  if (typeof structure.tag === "function") {
    const props = Object.fromEntries(structure.attributes ?? []);
    const result = await structure.tag(props);
    return await generateStructure(result);
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
    const fragment = document.createDocumentFragment();
    
    for (let child of structure.children) {
      const childElem =
        typeof child === "string"
          ? document.createTextNode(child)
          : generateStructure(child);
      elem.appendChild(childElem);
    }
    
    elem.appendChild(fragment);
  }
  
  return elem;
}
