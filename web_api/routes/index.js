import AboutPage from "../views/AboutPage.js";
import Gallery from "../views/GalleryPage.js";
import Page404 from "../views/Page404.js";
import TablePage from "../views/TablePage.js";

export default {
  "/home": {
    tag: TablePage,
  },
  "/gallery": {
    tag: Gallery,
  },
  "/about": {
    tag: AboutPage,
  },
  "*": {
    tag: Page404,
  },
};
