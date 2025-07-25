import { BrowserLink } from "../components/BrowserRouter.js";
import Header from "../components/Header.js";

export default async function Layout(contentStruct) {
  // Vérifier l'état d'authentification
  const isAuthenticated = checkAuthStatus();
  const isAdmin = checkAdminStatus();

  return {
    tag: "div",
    attributes: [["class", "min-h-screen bg-gray-50"]],
    children: [
      // Utiliser le composant Header
      await Header({ isAuthenticated, isAdmin }),
      {
        tag: "main",
        attributes: [["class", "p-6"]],
        children: contentStruct ? [contentStruct] : [],
      },
    ],
  };
}

// Fonctions utilitaires pour vérifier l'état d'authentification
function checkAuthStatus() {
  const user = localStorage.getItem('user');
  return !!user;
}

function checkAdminStatus() {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin' || userData.isAdmin === true;
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions admin:', error);
    return false;
  }
}
