import EvenementPage from "../views/EvenementPage.js";
import EvenementCreate from "../views/EvenementCreate.js";
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
  "/evenement": {
    tag: EvenementPage,
  },
  // "/evenement/:id": async () => {
  //   const pathParts = window.location.pathname.split('/');
  //   const eventId = pathParts[pathParts.length - 1];
  //   return {
  //     tag: EvenementDetail,
  //     attributes: [["eventId", eventId]],
  //   };
  // },
  "/evenement/create": {
    tag: EvenementCreate,
  },
  // "/evenement/edit/:id": async () => {
  //   const pathParts = window.location.pathname.split('/');
  //   const eventId = pathParts[pathParts.length - 1];
  //   return {
  //     tag: EvenementEdit,
  //     attributes: [["eventId", eventId]],
  //   };
  // },
  "*": {
    tag: Page404,
  },
};
