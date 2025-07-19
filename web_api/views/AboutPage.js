import { BrowserLink } from "../components/BrowserRouter.js";

export default function AboutPage() {
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
      { tag: "h1", children: ["About"] },
      { tag: "p", children: ["This is the about page."] },
    ],
  };
}
