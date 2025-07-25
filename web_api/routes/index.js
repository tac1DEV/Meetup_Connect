import EvenementPage from "../views/EvenementPage.js";
import EvenementCreate from "../views/EvenementCreate.js";
import Gallery from "../views/GalleryPage.js";
import Page404 from "../views/Page404.js";
import LandingPage from "../views/LandingPage.js";
import RegisterPage from "../views/RegisterPage.js";
import LoginPage from "../views/LoginPage.js";
import ProfilePage from "../views/ProfilePage.js";
import TestPage from "../views/TestPage.js";
import Communautes from "../views/Communautes.js";
import CommunautePage from "../views/CommunautePage.js";

import AdminPage from "../views/AdminPage.js";
import AdminUtilisateurs from "../views/AdminUtilisateurs.js";
import AdminEvenements from "../views/AdminEvenements.js";
import AdminCommunautes from "../views/AdminCommunautes.js";
import UseStateDemoPage from "../views/UseStateDemoPage.js";


export default {
  "/home": {
    tag: LandingPage,
  },
  "/gallery": {
    tag: Gallery,
  },
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
  "/admin/utilisateurs": {
    tag: AdminUtilisateurs,
  },
  "/admin/evenements": {
    tag: AdminEvenements,
  },
  "/admin/communautes": {
    tag: AdminCommunautes,
  },
  "/useState-demo": {
    tag: UseStateDemoPage,
  },
  "*": {
    tag: LandingPage,
  },
};
