import { supabase } from "../../config.js";
import { BrowserLink } from "../components/BrowserRouter.js";

export default async function Communaute() {
  const data = await supabase.query("communaute");
  return {
    tag: "div",
    children: [
      {
        tag: BrowserLink,
        attributes: [
          ["link", "/home"],
          ["title", "HomePage"],
        ],
      },
      {
        tag: BrowserLink,
        attributes: [
          ["link", "/gallery"],
          ["title", "Gallery"],
        ],
      },
      {
        tag: "div",
        attributes: [["class", "grid gap-4 mt-8"]],
        children: data.map((d) => ({
          tag: "div",
          attributes: [
            [
              "class",
              "p-4 bg-white shadow rounded border border-gray-200 space-y-1",
            ],
          ],
          children: [
            // 🔗 ID en lien cliquable
            {
              tag: BrowserLink,
              attributes: [
                ["link", `/communaute/${d.id}`],
                ["title", `ID: ${d.id}`],
                ["class", "text-blue-600 hover:underline"],
              ],
            },

            // 📝 Le reste des champs
            ...Object.entries(d)
              .filter(([key]) => key !== "id") // évite de réafficher l'id
              .map(([key, value]) => ({
                tag: "p",
                attributes: [["class", "text-sm text-gray-700"]],
                children: [`${key}: ${String(value ?? "")}`],
              })),
          ],
        })),
      },
      {
        tag: "form",
        attributes: [
          ["id", "create-communaute"],
          ["class", "max-w-xl mx-auto p-4 bg-white shadow rounded space-y-4"],
        ],
        events: {
          submit: [
            async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const payload = Object.fromEntries(formData.entries());

              // ✨ Ajouter les champs automatiques
              payload.date_creation = new Date().toISOString(); // ou supprime cette ligne pour laisser Supabase gérer avec default now()
              payload.id_createur = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
              payload.id_categorie = 19;

              // Nettoyage des champs vides
              Object.entries(payload).forEach(([key, value]) => {
                if (value === "") payload[key] = null;
              });

              await supabase.create("communaute", payload);
              window.dispatchEvent(new Event("pushstate"));
            },
          ],
        },
        children: [
          {
            tag: "h2",
            attributes: [["class", "text-2xl font-bold text-gray-800"]],
            children: ["Créer une communauté"],
          },
          {
            tag: "input",
            attributes: [
              ["name", "nom"],
              ["placeholder", "Nom"],
              ["required", ""],
              ["class", "w-full border border-gray-300 p-2 rounded"],
            ],
          },
          {
            tag: "textarea",
            attributes: [
              ["name", "description"],
              ["placeholder", "Description"],
              ["required", ""],
              ["class", "w-full border border-gray-300 p-2 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["name", "image"],
              ["placeholder", "URL image"],
              ["class", "w-full border border-gray-300 p-2 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["type", "number"],
              ["name", "nombre_max_membres"],
              ["placeholder", "Max membres"],
              ["class", "w-full border border-gray-300 p-2 rounded"],
            ],
          },
          {
            tag: "button",
            attributes: [
              ["type", "submit"],
              [
                "class",
                "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
              ],
            ],
            children: ["Créer"],
          },
        ],
      },
    ],
  };
}
