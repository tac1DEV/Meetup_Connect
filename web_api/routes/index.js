import Gallery from "../views/GalleryPage.js";
import Page404 from "../views/Page404.js";
import TablePage from "../views/TablePage.js";
import RegisterPage from "../views/RegisterPage.js";
import LoginPage from "../views/LoginPage.js";
import ProfilePage from "../views/ProfilePage.js";

import AdminPage from "../views/AdminPage.js";
import UseStateDemoPage from "../views/UseStateDemoPage.js";


export default {
  "/home": {
    tag: TablePage,
  },
  "/gallery": {
    tag: Gallery,
  },
  "/profile": {
    tag: ProfilePage,
  },
  "/login": {
    tag: LoginPage,
  },
  "/register": {
    tag: RegisterPage,
  },
  "/admin": {
    tag: AdminPage,
  },
  "/useState-demo": {
    tag: UseStateDemoPage,
  },
  "*": {
    tag: Page404,
  },
};
