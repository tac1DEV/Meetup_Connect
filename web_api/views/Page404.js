import { BrowserLink as Link } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";

const Page404 = function () {
  return {
    tag: "div",
    children: [
      {
        tag: Link,
        attributes: [
          ["link", "/home"],
          ["title", "HomePage"],
        ],
      },
      {
        tag: Link,
        attributes: [
          ["link", "/communautes"],
          ["title", "Communautés"],
        ],
      },
            {
        tag: Link,
        attributes: [
          ["link", "/evenement"],
          ["title", "Événements"],
        ],
      },
      {
        tag: "h1",
        children: ["Tu t'es perdu !"],
      },
    ],
  };
};

Page404.show = function () {};

export default Page404;
