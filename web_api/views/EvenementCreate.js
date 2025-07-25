import { supabase } from "../../config.js";
import Layout from "../components/Layout.js";

export default async function EvenementCreate() {
  const communautes = await supabase.query("communaute");

  const content = [
    {
    tag: "div",
    attributes: [["class", "bg-white p-6 rounded-lg shadow-lg"]],
    children: [
      {
        tag: "h2",
        attributes: [["class", "text-2xl font-semibold mb-4"]],
        children: ["Créer un nouvel événement"],
      },
      {
        tag: "form",
        attributes: [
          ["id", "create-evenement"],
          ["class", "space-y-4"],
        ],
        events: {
          submit: [
            async (e) => {
              e.preventDefault();
              await createEvent(e);
            },
          ],
        },
        children: createEventFormFields({}, communautes),
      },
    ],
  },
];

  return Layout(content);
}

// Fonction pour créer les champs du formulaire
function createEventFormFields(eventData = {}, communautes = []) {
  return [
    {
      tag: "div",
      attributes: [["class", "grid grid-cols-1 md:grid-cols-2 gap-4"]],
      children: [
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Nom de l'événement *"],
            },
            {
              tag: "input",
              attributes: [
                ["name", "nom"],
                ["placeholder", "Nom de l'événement"],
                ["required", ""],
                ["value", eventData.nom || ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Communauté *"],
            },
            {
              tag: "select",
              attributes: [
                ["name", "id_communaute"],
                ["required", ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
              children: communautes.map((communaute) => ({
                tag: "option",
                attributes: [
                  ["value", String(communaute.id)],
                  ...(eventData.id_communaute === communaute.id
                    ? [["selected", ""]]
                    : []),
                ],
                children: [communaute.nom],
              })),
            },
          ],
        },

        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Date et heure *"],
            },
            {
              tag: "input",
              attributes: [
                ["type", "datetime-local"],
                ["name", "date"],
                ["required", ""],
                [
                  "value",
                  eventData.date
                    ? new Date(eventData.date).toISOString().slice(0, 16)
                    : "",
                ],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
      ],
    },
    {
      tag: "div",
      attributes: [["class", "grid grid-cols-1 md:grid-cols-2 gap-4"]],
      children: [
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Lieu *"],
            },
            {
              tag: "input",
              attributes: [
                ["name", "lieu"],
                ["placeholder", "Lieu"],
                ["required", ""],
                ["value", eventData.lieu || ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Adresse complète *"],
            },
            {
              tag: "input",
              attributes: [
                ["name", "adresse_complete"],
                ["placeholder", "Adresse complète"],
                ["required", ""],
                ["value", eventData.adresse_complete || ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
      ],
    },
    {
      tag: "div",
      children: [
        {
          tag: "label",
          attributes: [
            ["class", "block text-sm font-medium text-gray-700 mb-1"],
          ],
          children: ["Description *"],
        },
        {
          tag: "textarea",
          attributes: [
            ["name", "description"],
            ["placeholder", "Description de l'événement"],
            ["rows", "3"],
            [
              "class",
              "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
            ],
          ],
          children: [eventData.description || ""],
        },
      ],
    },
    {
      tag: "div",
      attributes: [["class", "grid grid-cols-1 md:grid-cols-3 gap-4"]],
      children: [
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Visibilité"],
            },
            {
              tag: "select",
              attributes: [
                ["name", "visibilite"],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
              children: [
                {
                  tag: "option",
                  attributes: [
                    ["value", "true"],
                    ...(eventData.visibilite === true
                      ? [["selected", ""]]
                      : []),
                  ],
                  children: ["Visible"],
                },
                {
                  tag: "option",
                  attributes: [
                    ["value", "false"],
                    ...(eventData.visibilite === false
                      ? [["selected", ""]]
                      : []),
                  ],
                  children: ["Privé"],
                },
              ],
            },
          ],
        },
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Participants max"],
            },
            {
              tag: "input",
              attributes: [
                ["type", "number"],
                ["name", "nombre_max_participants"],
                ["placeholder", "Illimité"],
                ["value", eventData.nombre_max_participants || ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Prix (€)"],
            },
            {
              tag: "input",
              attributes: [
                ["type", "number"],
                ["step", "0.01"],
                ["name", "prix"],
                ["placeholder", "0.00"],
                ["value", eventData.prix || ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
      ],
    },
    {
      tag: "div",
      attributes: [["class", "grid grid-cols-1 md:grid-cols-2 gap-4"]],
      children: [
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Image (URL)"],
            },
            {
              tag: "input",
              attributes: [
                ["name", "image"],
                ["placeholder", "https://..."],
                ["value", eventData.image || ""],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
            },
          ],
        },
        {
          tag: "div",
          children: [
            {
              tag: "label",
              attributes: [
                ["class", "block text-sm font-medium text-gray-700 mb-1"],
              ],
              children: ["Statut"],
            },
            {
              tag: "select",
              attributes: [
                ["name", "statut"],
                [
                  "class",
                  "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
                ],
              ],
              children: [
                {
                  tag: "option",
                  attributes: [
                    ["value", "planifie"],
                    ...(eventData.statut === "planifie"
                      ? [["selected", ""]]
                      : []),
                  ],
                  children: ["Planifié"],
                },
                {
                  tag: "option",
                  attributes: [
                    ["value", "termine"],
                    ...(eventData.statut === "termine"
                      ? [["selected", ""]]
                      : []),
                  ],
                  children: ["Terminé"],
                },
                {
                  tag: "option",
                  attributes: [
                    ["value", "annule"],
                    ...(eventData.statut === "annule"
                      ? [["selected", ""]]
                      : []),
                  ],
                  children: ["Annulé"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      tag: "div",
      attributes: [["class", "flex justify-end"]],
      children: [
        {
          tag: "button",
          attributes: [
            ["type", "submit"],
            [
              "class",
              "px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
            ],
          ],
          children: ["Créer l'événement"],
        },
      ],
    },
  ];
}

// Fonctions CRUD
async function createEvent(e) {
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  // Champs automatiques
  payload.date_creation = new Date().toISOString();
  payload.id_communaute = Number(9);
  payload.latitude = 48.8566;
  payload.longitude = 2.3522;

  // Nettoyage et conversion des types
  payload.visibilite = payload.visibilite === "true";
  payload.nombre_max_participants =
    parseInt(payload.nombre_max_participants) || null;
  payload.prix = parseFloat(payload.prix) || 0;

  // Champs vides → null
  Object.entries(payload).forEach(([k, v]) => {
    if (v === "") payload[k] = null;
  });

  try {
    const result = await supabase.create("evenement", payload);
    if (result) {
      alert("Événement créé avec succès !");
      e.target.reset();
      history.pushState({}, "", "/web_api/evenement");
      window.dispatchEvent(new Event("pushstate"));
    } else {
      alert("Erreur lors de la création de l'événement");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la création de l'événement");
  }
}
