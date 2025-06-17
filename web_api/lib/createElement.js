export default function createElement(tag, attributes, ...children) {
  return {
    tag,
    attributes: Object.entries(attributes),
    children,
  };
}
