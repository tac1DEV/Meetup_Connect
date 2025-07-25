import { BrowserLink } from "../components/BrowserRouter.js";
import createElement from "../lib/createElement.js";
import Layout from "../components/Layout.js";
import { createIntersectionObserver, preloadImages } from "../lib/performance.js";

export default function Gallery() {
  const content = [
    {
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
        tag: "div",
        children: Array.from({ length: 500 }, (_, index) => ({
          tag: "img",
          attributes: [["src", "https://picsum.photos/200?random=" + index]],
        })),
      },
    ],
  },
];

return Layout(content);
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
