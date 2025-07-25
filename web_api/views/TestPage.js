import Layout from "./Layout.js";

export default async function TestPage() {
  const content = {
    tag: "div",
    attributes: [["class", "p-4"]],
    children: [
      {
        tag: "h1",
        attributes: [["class", "text-2xl font-bold mb-4"]],
        children: ["Test Page - Meetup Connect"]
      },
      {
        tag: "p",
        attributes: [["class", "text-gray-600"]],
        children: ["Cette page de test confirme que le système de rendu fonctionne correctement."]
      },
      {
        tag: "div",
        attributes: [["class", "mt-4 p-4 bg-blue-100 rounded"]],
        children: [
          {
            tag: "h2",
            attributes: [["class", "text-lg font-semibold mb-2"]],
            children: ["Statut du système :"]
          },
          {
            tag: "ul",
            attributes: [["class", "list-disc list-inside"]],
            children: [
              {
                tag: "li",
                children: ["✅ Router fonctionnel"]
              },
              {
                tag: "li",
                children: ["✅ Layout appliqué"]
              },
              {
                tag: "li",
                children: ["✅ Génération de structure DOM"]
              }
            ]
          }
        ]
      }
    ]
  };
  
  return await Layout(content);
} 