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
        tag: "h1",
        children: ["Tu t'es perdu !!! Game Over !!!"],
      },
    ],
  };
};

Page404.show = function () {};

export default Page404;
