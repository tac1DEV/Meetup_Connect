export default async function generateStructure(structure) {
  if (typeof structure.tag === "function") {
    const props = Object.fromEntries(structure.attributes ?? []);
    const result = await structure.tag(props);
    return await generateStructure(result);
  }
  const elem = document.createElement(structure.tag);
  if (structure.attributes) {
    for (let attribute of structure.attributes) {
      const attrName = attribute[0];
      const attrValue = attribute[1];
      if (attrName === "style") {
        Object.assign(elem.style, attrValue);
      } else if (attrName === "class") {
        elem.className = attrValue;
      } else {
        elem.setAttribute(attrName, attrValue);
      }
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
      elem.appendChild(childElem);
    }
  }
  return elem;
}
