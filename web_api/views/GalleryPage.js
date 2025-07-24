import { BrowserLink } from "../components/BrowserRouter.js";
import createElement from "../lib/createElement.js";
import Layout from "../components/Layout.js";
import { createIntersectionObserver, preloadImages } from "../lib/performance.js";

export default function Gallery() {
  const content = [
    {
      tag: "div",
      attributes: [
        ["style", {
          marginBottom: "2rem"
        }]
      ],
      children: [
        {
          tag: "h1",
          attributes: [
            ["style", {
              color: "#2c3e50",
              marginBottom: "1rem"
            }]
          ],
          children: ["Galerie de photos"]
        },
        {
          tag: "p",
          attributes: [
            ["style", {
              color: "#7f8c8d",
              marginBottom: "1rem"
            }]
          ],
          children: ["Découvrez notre collection d'images"]
        }
      ]
    },
    {
      tag: "div",
      attributes: [
        ["class", "gallery-grid"],
        ["style", {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          padding: "1rem 0"
        }]
      ],
      children: Array.from({ length: 20 }, (_, index) => ({
        tag: "div",
        attributes: [
          ["class", "gallery-item"],
          ["style", {
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
            cursor: "pointer"
          }]
        ],

        events: {
          mouseenter: [
            function(event) {
              event.currentTarget.style.transform = "scale(1.05)";
              event.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
            }
          ],
          mouseleave: [
            function(event) {
              event.currentTarget.style.transform = "scale(1)";
              event.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }
          ]
        },
        children: [
          {
            tag: "img",
            attributes: [
              ["data-src", "https://picsum.photos/200?random=" + index],
              ["src", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3C/svg%3E"],
              ["class", "lazy-image"],
              ["style", {
                width: "100%",
                height: "200px",
                objectFit: "cover",
                transition: "opacity 0.3s ease"
              }]
            ],
          }
        ]
      })),
    },
  ];

  return Layout(content);
}

// Fonction pour initialiser le lazy loading après le rendu
export function initGalleryLazyLoading() {
  const observer = createIntersectionObserver((img) => {
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.remove('lazy-image');
    }
  });

  // Observer toutes les images lazy
  document.querySelectorAll('.lazy-image').forEach(img => {
    observer.observe(img);
  });
}

async function GalleryDatabase() {
  const res = await fetch("/photos.json");
  const photos = await res.json();

  return {
    tag: "div",
    children: photos.map((photo) => ({
      tag: "img",
      attributes: [
        ["src", photo.url],
        ["alt", photo.title],
      ],
    })),
  };
}

async function GalleryDatabase2() {
  const res = await fetch("/photos.json");
  const photos = await res.json();

  return createElement(
    "div",
    {},
    photos.map((photo) =>
      createElement("img", {
        src: photo.url,
        alt: photo.title,
      })
    )
  );
}
