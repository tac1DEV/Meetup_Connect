import { supabase } from "../../config.js";
import { BrowserLink } from "../components/BrowserRouter.js";

export default async function Evenement() {
  const data = await supabase.query("evenement");
  return {
    tag: "div",
    children: [
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
            {
              tag: BrowserLink,
              attributes: [
                ["link", `/evenement/${d.id}`],
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
          ["id", "create-evenement"],
          ["class", "max-w-xl mx-auto p-4 bg-white shadow rounded space-y-4"],
        ],
        events: {
          submit: [
            async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const payload = Object.fromEntries(formData.entries());

              // Champs automatiques
              payload.date_creation = new Date().toISOString();
              payload.id_communaute = Number(9);
              payload.latitude = 48.8566;
              payload.longitude = 2.3522;

              // Nettoyage : convertir les types
              payload.visibilite = payload.visibilite === "true";
              payload.nombre_max_participants =
                parseInt(payload.nombre_max_participants) || null;
              payload.prix = parseFloat(payload.prix) || 0;

              // Champs vides → null
              Object.entries(payload).forEach(([k, v]) => {
                if (v === "") payload[k] = null;
              });

              await supabase.create("evenement", payload);
              window.dispatchEvent(new Event("pushstate"));
            },
          ],
        },
        children: [
          {
            tag: "h2",
            attributes: [["class", "text-xl font-bold"]],
            children: ["Créer un événement"],
          },

          {
            tag: "input",
            attributes: [
              ["name", "nom"],
              ["placeholder", "Nom de l'événement"],
              ["required", ""],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["type", "datetime-local"],
              ["name", "date"],
              ["required", ""],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["name", "lieu"],
              ["placeholder", "Lieu"],
              ["required", ""],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["name", "adresse_complete"],
              ["placeholder", "Adresse complète"],
              ["required", ""],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "textarea",
            attributes: [
              ["name", "description"],
              ["placeholder", "Description"],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "select",
            attributes: [
              ["name", "visibilite"],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
            children: [
              {
                tag: "option",
                attributes: [["value", "true"]],
                children: ["Visible"],
              },
              {
                tag: "option",
                attributes: [["value", "false"]],
                children: ["Privé"],
              },
            ],
          },
          {
            tag: "input",
            attributes: [
              ["type", "number"],
              ["name", "nombre_max_participants"],
              ["placeholder", "Nombre max de participants"],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["type", "number"],
              ["step", "0.01"],
              ["name", "prix"],
              ["placeholder", "Prix (€)"],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "input",
            attributes: [
              ["name", "image"],
              ["placeholder", "URL de l'image"],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
          },
          {
            tag: "select",
            attributes: [
              ["name", "statut"],
              ["class", "w-full p-2 border border-gray-300 rounded"],
            ],
            children: [
              {
                tag: "option",
                attributes: [["value", "planifie"]],
                children: ["Planifié"],
              },
              {
                tag: "option",
                attributes: [["value", "termine"]],
                children: ["Terminé"],
              },
              {
                tag: "option",
                attributes: [["value", "annule"]],
                children: ["Annulé"],
              },
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
            children: ["Créer l'événement"],
          },
        ],
      },
    ],
  };
}
