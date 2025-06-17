import { BrowserLink as Link } from "../components/BrowserRouter.js";

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
          ["link", "/gallery"],
          ["title", "Gallery"],
        ],
      },
      {
        tag: "h1",
        children: ["Tu t'es perdu !!! Game Over !!!"],
      },
    ],
  };
};

Page404.show = function () {};

export default Page404;
