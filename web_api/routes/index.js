import Gallery from "../views/GalleryPage.js";
import Page404 from "../views/Page404.js";
import TablePage from "../views/TablePage.js";
import RegisterPage from "../views/RegisterPage.js";
import LoginPage from "../views/LoginPage.js";
import ProfilePage from "../views/ProfilePage.js";

export default {
  "/home": {
    tag: TablePage,
  },
  "/gallery": {
    tag: Gallery,
  },
  "/register": {
    tag: RegisterPage,
  },
  "/login": {
    tag: LoginPage,
  },
  "/profile": {
    tag: ProfilePage,
  },
  "*": {
    tag: Page404,
  },
};
