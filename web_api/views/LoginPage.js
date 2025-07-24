import supabase from "../config.js";
import Layout from "../components/Layout.js";

export default function LoginPage() {
  const content = [
    {
      tag: "div",
      attributes: [["style", {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        backgroundColor: "#fff",
        padding: "20px",
        fontFamily: "sans-serif",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }]],
      children: [
        {
          tag: "form",
          attributes: [["id", "login-form"], ["style", {
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
              const email = form.elements["email"].value;
              const password = form.elements["password"].value;
              const resultDiv = form.querySelector(".result");
              const res = await supabase.login(email, password);
              if (res.error) {
                resultDiv.textContent = `Erreur: ${res.error}`;
              } else {
                resultDiv.textContent = "Connexion réussie !";
                localStorage.setItem("sb_token", res.access_token);
                window.location.href = "/web_api/profile";
              }
            }],
          },
          children: [
            { tag: "h2", attributes: [["style", {textAlign: "center", fontSize: "22px", fontWeight: "bold", color: "#2c3e50"}]], children: ["CONNEXION"] },
            {
              tag: "div",
              attributes: [["style", {
                textAlign: "center",
                fontSize: "14px",
                marginBottom: "8px",
              }]],
              children: [
                { tag: "span", children: ["Ou vous pouvez "] },
                {
                  tag: "a",
                  attributes: [
                    ["href", "/web_api/register"],
                    ["style", {
                      color: "#5A3FF3",
                      textDecoration: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }]
                  ],
                  children: ["vous inscrire ici"]
                }
              ]
            },

            { tag: "input", attributes: [["type", "email"], ["name", "email"], ["placeholder", "Email"], ["required", true], ["style", inputStyle()]] },
            { tag: "input", attributes: [["type", "password"], ["name", "password"], ["placeholder", "Mot de passe"], ["required", true], ["style", inputStyle()]] },

            { tag: "hr" },
            { tag: "p", attributes: [["style", {textAlign: "center", fontSize: "14px", marginTop: "8px"}]], children: ["Connexion avec"] },

            
            {
              tag: "button",
              attributes: [["type", "button"], ["style", socialButtonStyle("Google")]],
              children: [
                { tag: "img", attributes: [["src", "https://www.svgrepo.com/show/475656/google-color.svg"], ["style", {width: "18px", marginRight: "8px"}]] },
                "Connexion avec Google"
              ]
            },
            {
              tag: "button",
              attributes: [["type", "button"], ["style", socialButtonStyle("Facebook")]],
              children: [
                { tag: "img", attributes: [["src", "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"], ["style", {width: "18px", marginRight: "8px"}]] },
                "Connexion avec Facebook"
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
            }]], children: ["Se connecter"] },

            { tag: "div", attributes: [["class", "result"], ["style", {color: "#5A3FF3", minHeight: "24px", textAlign: "center"}]], children: [] },
          ],
        },
      ],
    }
  ];

  return Layout(content);

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