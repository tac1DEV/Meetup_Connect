// import { supabase } from "../../config.js";
import { BrowserLink } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";
import { createClient } from "@supabase/supabase-js";

export default async function EvenementPage() {
  const communautes = await supabase.query("communaute");
  const data = await supabase.query("evenement");

  const content = [
    {
      tag: "div",
      attributes: [["class", "container mx-auto p-4 space-y-8"]],
      children: [
        // Titre de la page
        {
          tag: "h1",
          attributes: [["class", "text-3xl font-bold text-center mb-8"]],
          children: ["Liste des évènements"],
        },

        {
          tag: "div",
          attributes: [["class", "bg-gray-50 p-6 rounded-lg"]],
          children: [
            {
              tag: "div",
              attributes: [["class", "flex justify-end items-center mb-4"]],
              children: [
                {
                  tag: BrowserLink,
                  attributes: [
                    ["link", "/evenement/create"],
                    ["title", "Nouvel événement"],
                    [
                      "class",
                      "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium",
                    ],
                  ],
                },
              ],
            },
            {
              tag: "div",
              attributes: [["class", "grid gap-4"]],
              children: data.map((d) => ({
                tag: "div",
                attributes: [
                  [
                    "class",
                    "p-4 bg-white shadow rounded border border-gray-200 space-y-3",
                  ],
                  ["data-event-id", d.id],
                ],
                children: [
                  {
                    tag: "div",
                    attributes: [["class", "flex justify-between items-start"]],
                    children: [
                      {
                        tag: BrowserLink,
                        attributes: [
                          ["link", `/evenement/${d.id}`],
                          ["title", d.nom || `Événement ${d.id}`],
                          [
                            "class",
                            "text-xl font-semibold text-blue-600 hover:underline",
                          ],
                        ],
                      },
                      {
                        tag: "div",
                        attributes: [["class", "flex gap-2"]],
                        children: [
                          {
                            tag: "button",
                            attributes: [
                              [
                                "class",
                                "px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm",
                              ],
                              ["data-action", "edit"],
                              ["data-event-id", d.id],
                            ],
                            events: {
                              click: [
                                (e) => {
                                  const eventId =
                                    e.target.getAttribute("data-event-id");
                                  toggleEditForm(eventId, d);
                                },
                              ],
                            },
                            children: ["Modifier"],
                          },
                          {
                            tag: "button",
                            attributes: [
                              [
                                "class",
                                "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm",
                              ],
                              ["data-action", "delete"],
                              ["data-event-id", d.id],
                            ],
                            events: {
                              click: [
                                async (e) => {
                                  const eventId =
                                    e.target.getAttribute("data-event-id");
                                  if (
                                    confirm(
                                      "Êtes-vous sûr de vouloir supprimer cet événement ?"
                                    )
                                  ) {
                                    await deleteEvent(eventId);
                                  }
                                },
                              ],
                            },
                            children: ["Supprimer"],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    tag: "div",
                    attributes: [
                      [
                        "class",
                        "grid grid-cols-1 md:grid-cols-2 gap-2 text-sm",
                      ],
                    ],
                    children: Object.entries(d)
                      .filter(([key]) => key !== "id" && key !== "nom")
                      .map(([key, value]) => ({
                        tag: "div",
                        attributes: [["class", "flex"]],
                        children: [
                          {
                            tag: "span",
                            attributes: [
                              ["class", "font-medium text-gray-600 w-32"],
                            ],
                            children: [`${key}:`],
                          },
                          {
                            tag: "span",
                            attributes: [["class", "text-gray-800"]],
                            children: [String(value ?? "N/A")],
                          },
                        ],
                      })),
                  },
                  {
                    tag: "div",
                    attributes: [
                      ["class", "hidden mt-4 p-4 bg-gray-50 rounded border"],
                      ["data-edit-form", d.id],
                    ],
                    children: [
                      {
                        tag: "h4",
                        attributes: [["class", "font-semibold mb-3"]],
                        children: ["Modifier l'événement"],
                      },
                      createEditForm(d, communautes),
                    ],
                  },
                ],
              })),
            },
          ],
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
          children: ["Description"],
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

// Fonction pour créer le formulaire de modification
function createEditForm(eventData, communautes = []) {
  return {
    tag: "form",
    attributes: [
      ["data-edit-form-element", eventData.id],
      ["class", "space-y-3"],
    ],
    events: {
      submit: [
        async (e) => {
          e.preventDefault();
          await updateEvent(e, eventData.id);
        },
      ],
    },
    children: [
      ...createEventFormFields(eventData, communautes).slice(0, -1),
      {
        tag: "div",
        attributes: [["class", "flex justify-end gap-2"]],
        children: [
          {
            tag: "button",
            attributes: [
              ["type", "button"],
              [
                "class",
                "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600",
              ],
            ],
            events: {
              click: [
                (e) => {
                  const form = e.target.closest("[data-edit-form]");
                  form.classList.add("hidden");
                },
              ],
            },
            children: ["Annuler"],
          },
          {
            tag: "button",
            attributes: [
              ["type", "submit"],
              [
                "class",
                "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700",
              ],
            ],
            children: ["Sauvegarder"],
          },
        ],
      },
    ],
  };
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
      window.dispatchEvent(new Event("pushstate"));
    } else {
      alert("Erreur lors de la création de l'événement");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la création de l'événement");
  }
}

async function updateEvent(e, eventId) {
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  // Nettoyage et conversion des types
  payload.visibilite = payload.visibilite === "true";
  payload.nombre_max_participants =
    parseInt(payload.nombre_max_participants) || null;
  payload.prix = parseFloat(payload.prix) || 0;

  // Champs vides → null
  Object.entries(payload).forEach(([k, v]) => {
    if (v === "") payload[k] = null;
  });

  console.log("Mise à jour événement :", {
    id: eventId,
    data: payload,
  });
  try {
    const result = await supabase.update("evenement", eventId, payload);
    if (result) {
      alert("Événement mis à jour avec succès !");
      const editForm = document.querySelector(`[data-edit-form="${eventId}"]`);
      if (editForm) editForm.classList.add("hidden");
      window.dispatchEvent(new Event("pushstate"));
    } else {
      alert("Erreur lors de la mise à jour de l'événement");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la mise à jour de l'événement");
  }
}

async function deleteEvent(eventId) {
  try {
    const result = await supabase.delete("evenement", eventId);
    if (result) {
      window.dispatchEvent(new Event("pushstate"));
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la suppression de l'événement");
  }
}

function toggleEditForm(eventId, eventData) {
  const editForm = document.querySelector(`[data-edit-form="${eventId}"]`);
  if (editForm) {
    editForm.classList.toggle("hidden");
  }
}

const SUPABASE_URL = "https://wxfruxhckurswdcbdxwq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInvoke() {
  const { data, error } = await supabase.functions.invoke("CRUD", {
    body: { name: "Functions" },
  });

  if (error) {
    console.error("Erreur:", error);
  } else {
    console.log("Résultat:", data);
  }
}

testInvoke();
