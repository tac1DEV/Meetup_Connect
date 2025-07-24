import { BrowserLink } from "../components/BrowserRouter.js";

export default async function Layout(contentStruct) {
  return {
    tag: "div",
    attributes: [["class", "min-h-screen bg-gray-50"]],
    children: [
      {
        tag: "nav",
        attributes: [["class", "bg-white shadow p-4 flex gap-4"]],
        children: [
          {
            tag: BrowserLink,
            attributes: [
              ["link", "/home"],
              ["title", "HomePage"],
              ["class", "text-blue-600 hover:underline"],
            ],
          },
          {
            tag: BrowserLink,
            attributes: [
              ["link", "/gallery"],
              ["title", "Gallery"],
              ["class", "text-blue-600 hover:underline"],
            ],
          },
          {
            tag: BrowserLink,
            attributes: [
              ["link", "/evenement"],
              ["title", "Evenement"],
              ["class", "text-blue-600 hover:underline"],
            ],
          },
        ],
      },
      {
        tag: "main",
        attributes: [["class", "p-6"]],
        children: contentStruct ? [contentStruct] : [],
      },
    ],
  };
}
