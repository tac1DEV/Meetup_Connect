import EvenementPage from "../views/EvenementPage.js";
import EvenementCreate from "../views/EvenementCreate.js";
import Page404 from "../views/Page404.js";
import RegisterPage from "../views/RegisterPage.js";
import LoginPage from "../views/LoginPage.js";
import ProfilePage from "../views/ProfilePage.js";
import Communautes from "../views/Communautes.js";
import CommunautePage from "../views/CommunautePage.js";

import AdminPage from "../views/AdminPage.js";


export default {
  "/communautes": {
    tag: Communautes,
  },
  "/communaute": {
    tag: CommunautePage,
  },
  "/communaute/:id": {
    tag: CommunautePage,
  },
  "/evenement": {
    tag: EvenementPage,
  },

  "/evenement/create": {
    tag: EvenementCreate,
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
  "*": {
    tag: Page404,
  },
};
