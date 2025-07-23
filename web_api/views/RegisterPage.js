import supabase from "../config.js";

export default function RegisterPage() {
  return {
    tag: "div",
    attributes: [["style", {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#fff",
      padding: "20px",
      fontFamily: "sans-serif",
    }]],
    children: [
      {
        tag: "form",
        attributes: [["id", "register-form"], ["style", {
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }]],
        events: {
          submit: [async function (event) {
            event.preventDefault();
            const form = event.currentTarget;
            const nom = form.elements["nom"].value;
            const prenom = form.elements["prenom"].value;
            const pseudo = form.elements["pseudo"].value;
            const email = form.elements["email"].value;
            const password = form.elements["password"].value;
            const confirmPassword = form.elements["confirm-password"].value;
            const resultDiv = form.querySelector(".result");
            if (password !== confirmPassword) {
              resultDiv.textContent = "Les mots de passe ne correspondent pas.";
              return;
            }
            const res = await supabase.register(email, password);
            if (res.error) {
              resultDiv.textContent = `Erreur: ${res.error}`;
            } else {
              const userId = res.user?.id || res.id || (res.data && res.data.user && res.data.user.id);
              if (userId) {
                await supabase.createUtilisateur({ id: userId, nom, prenom, pseudo });
              }
              
              const loginRes = await supabase.login(email, password);
              if (!loginRes.error) {
                localStorage.setItem("sb_token", loginRes.access_token);
                window.location.href = "/web_api/profile";
              } else {
                resultDiv.textContent = "Inscription réussie ! Vérifiez vos emails.";
              }
            }
          }],
        },
        children: [
          { tag: "h2", attributes: [["style", {textAlign: "center", fontSize: "22px", fontWeight: "bold"}]], children: ["INSCRIPTION"] },
          {
            tag: "div",
            attributes: [["style", {
              textAlign: "center",
              fontSize: "14px",
              marginBottom: "8px",
            }]],
            children: [
              { tag: "span", children: ["Déjà un compte ? "] },
              {
                tag: "a",
                attributes: [
                  ["href", "/web_api/login"],
                  ["style", {
                    color: "#5A3FF3",
                    textDecoration: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }]
                ],
                children: ["Connexion"]
              }
            ]
          },

          { tag: "input", attributes: [["type", "text"], ["name", "nom"], ["placeholder", "Nom"], ["required", true], ["style", inputStyle()]] },
          { tag: "input", attributes: [["type", "text"], ["name", "prenom"], ["placeholder", "Prénom"], ["required", true], ["style", inputStyle()]] },
          { tag: "input", attributes: [["type", "text"], ["name", "pseudo"], ["placeholder", "Pseudo"], ["required", true], ["style", inputStyle()]] },
          { tag: "input", attributes: [["type", "email"], ["name", "email"], ["placeholder", "Email"], ["required", true], ["style", inputStyle()]] },
          { tag: "input", attributes: [["type", "password"], ["name", "password"], ["placeholder", "Mot de passe"], ["required", true], ["style", inputStyle()]] },
          { tag: "input", attributes: [["type", "password"], ["name", "confirm-password"], ["placeholder", "Confirmer le mot de passe"], ["required", true], ["style", inputStyle()]] },

          { tag: "hr" },
          { tag: "p", attributes: [["style", {textAlign: "center", fontSize: "14px", marginTop: "8px"}]], children: ["Inscription avec"] },

          
          {
            tag: "button",
            attributes: [["type", "button"], ["style", socialButtonStyle("Google")]],
            children: [
              { tag: "img", attributes: [["src", "https://www.svgrepo.com/show/475656/google-color.svg"], ["style", {width: "18px", marginRight: "8px"}]] },
              "Inscription avec Google"
            ]
          },
          {
            tag: "button",
            attributes: [["type", "button"], ["style", socialButtonStyle("Facebook")]],
            children: [
              { tag: "img", attributes: [["src", "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"], ["style", {width: "18px", marginRight: "8px"}]] },
              "Inscription avec Facebook"
            ]
          },

          { tag: "button", attributes: [["type", "submit"], ["style", {
            backgroundColor: "#5A3FF3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: "bold",
            marginTop: "10px",
            cursor: "pointer",
          }]], children: ["S'inscrire"] },

          { tag: "div", attributes: [["class", "result"], ["style", {color: "#5A3FF3", minHeight: "24px", textAlign: "center"}]], children: [] },
        ],
      },
    ],
  };
}


function inputStyle() {
  return {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  };
}


function socialButtonStyle(type) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  };
}
