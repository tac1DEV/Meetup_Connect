# Déploiement du site Meetup_Connect sur Netlify (méthode glisser-déposer)

## Déploiement rapide par glisser-déposer

1. **Préparez votre dossier**
   - Assurez-vous que tous vos fichiers sont bien à jour dans le dossier `web_api`.
   - Vérifiez la présence du fichier `netlify.toml` (pour les redirections et la configuration SPA).

2. **Connectez-vous à Netlify**
   - Rendez-vous sur [https://app.netlify.com/](https://app.netlify.com/) et connectez-vous ou créez un compte.

3. **Déployez votre site**
   - Sur le tableau de bord Netlify, cliquez sur "Add new site" > "Deploy manually".
   - Faites glisser le dossier `web_api` depuis votre explorateur de fichiers vers la zone prévue sur la page Netlify.
   - Attendez que le déploiement soit terminé.

4. **Accédez à votre site**
   - Netlify vous fournira une URL publique pour accéder à votre site.
   - Toutes les routes (ex: `/login`, `/profile`) fonctionneront grâce au fichier `netlify.toml`.

## Astuces
- Si vous faites des modifications, répétez simplement l'étape 3 pour mettre à jour votre site.
- Vous pouvez personnaliser le nom du site dans les paramètres Netlify après le déploiement.

---

**Fichiers importants à inclure dans le dossier `web_api` :**
- `index.html`
- `index.js` (et tout autre fichier JS/CSS utilisé)
- `netlify.toml`
- Toutes vos pages, images, assets nécessaires

**Fichiers à ne pas inclure (grâce à `.gitignore`) :**
- `node_modules/`
- Fichiers temporaires, logs, etc.

