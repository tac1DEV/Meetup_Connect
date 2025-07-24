export default function createElement(tag, attributes, ...children) {
  const events = {};
  const normalAttributes = {};
  
  // Séparer les événements des attributs normaux
  if (attributes) {
    for (let key in attributes) {
      if (key === 'events') {
        Object.assign(events, attributes[key]);
      } else {
        normalAttributes[key] = attributes[key];
      }
    }
  }
  
  const result = {
    tag,
    attributes: Object.entries(normalAttributes),
    children,
  };
  
  // Ajouter les événements seulement s'il y en a
  if (Object.keys(events).length > 0) {
    result.events = events;
  }
  
  return result;
}
