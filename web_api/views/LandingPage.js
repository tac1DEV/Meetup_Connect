import { BrowserLink as Link } from "../components/BrowserRouter.js";
import Layout from "../components/Layout.js";

export default function LandingPage() {
  const content = [
    // HERO
    {
      tag: "section",
      attributes: [["style", {
        background: "linear-gradient(135deg, #4730DC 0%, #4f8cff 100%)",
        color: "white",
        padding: "60px 20px 40px 20px",
        textAlign: "center",
        borderRadius: "0 0 32px 32px",
        marginBottom: "40px"
      }]],
      children: [
        { tag: "h1", attributes: [["style", { fontSize: "2.8rem", margin: 0 }]], children: ["Meetup Connect"] },
        { tag: "p", attributes: [["style", { fontSize: "1.3rem", margin: "18px 0 0 0", opacity: "0.95" }]], children: ["Connectez-vous, partagez, et créez des moments inoubliables avec votre communauté !"] },
        { tag: Link, attributes: [["link", "/register"], ["title", "Inscription"], ["style", {
          display: "inline-block",
          marginTop: "32px",
          background: "#ff9800",
          color: "white",
          padding: "16px 40px",
          borderRadius: "30px",
          fontSize: "1.2rem",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(79,140,255,0.15)",
          transition: "background 0.2s"
        }]], children: ["Commencer maintenant"] },
        { tag: "div", attributes: [["style", { marginTop: "18px" }]], children: [
          { tag: Link, attributes: [["link", "/login"], ["title", "Connexion"], ["style", {
            color: "#fff",
            textDecoration: "underline",
            fontSize: "1rem",
            marginRight: "18px"
          }]], children: ["Déjà inscrit ? Connexion"] },
          { tag: Link, attributes: [["link", "/communautes"], ["title", "Explorer"], ["style", {
            color: "#fff",
            textDecoration: "underline",
            fontSize: "1rem"
          }]], children: ["Explorer sans compte"] }
        ]}
      ]
    },
    // POURQUOI CHOISIR
    {
      tag: "section",
      attributes: [["style", { maxWidth: "900px", margin: "0 auto 40px auto", padding: "0 20px" }]],
      children: [
        { tag: "h2", attributes: [["style", { color: "#4730DC", fontSize: "2rem", marginBottom: "18px" }]], children: ["Pourquoi choisir Meetup Connect ?"] },
        {
          tag: "div",
          attributes: [["style", { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "10px" }]],
          children: [
            { tag: "div", children: [
              { tag: "span", attributes: [["style", { fontSize: "2.2rem" }]], children: ["🔒"] },
              { tag: "h3", attributes: [["style", { color: "#4730DC", fontSize: "1.1rem", margin: "10px 0 6px 0" }]], children: ["Sécurité & Respect"] },
              { tag: "p", attributes: [["style", { color: "#333", fontSize: "1rem" }]], children: ["Vos données et votre vie privée sont protégées. Pas de spam, pas de revente de données."] }
            ]},
            { tag: "div", children: [
              { tag: "span", attributes: [["style", { fontSize: "2.2rem" }]], children: ["⚡"] },
              { tag: "h3", attributes: [["style", { color: "#4730DC", fontSize: "1.1rem", margin: "10px 0 6px 0" }]], children: ["Simplicité & Rapidité"] },
              { tag: "p", attributes: [["style", { color: "#333", fontSize: "1rem" }]], children: ["Inscription rapide, navigation intuitive, tout est pensé pour aller à l’essentiel."] }
            ]},
            { tag: "div", children: [
              { tag: "span", attributes: [["style", { fontSize: "2.2rem" }]], children: ["🌍"] },
              { tag: "h3", attributes: [["style", { color: "#4730DC", fontSize: "1.1rem", margin: "10px 0 6px 0" }]], children: ["Communautés variées"] },
              { tag: "p", attributes: [["style", { color: "#333", fontSize: "1rem" }]], children: ["Des groupes pour tous les goûts, passions et régions. Créez ou rejoignez facilement."] }
            ]}
          ]
        }
      ]
    },
    // FONCTIONNALITÉS
    {
      tag: "section",
      attributes: [["style", { maxWidth: "900px", margin: "0 auto 40px auto", padding: "0 20px" }]],
      children: [
        { tag: "h2", attributes: [["style", { color: "#4730DC", fontSize: "2rem", marginBottom: "18px" }]], children: ["Fonctionnalités principales"] },
        {
          tag: "ul",
          attributes: [["style", { listStyle: "none", padding: 0, fontSize: "1.1rem", color: "#333", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }]],
          children: [
            { tag: "li", children: ["🔍 Découvrez des groupes et événements près de chez vous"] },
            { tag: "li", children: ["🗓️ Créez ou rejoignez des événements facilement"] },
            { tag: "li", children: ["📸 Partagez vos meilleurs moments en photos"] },
            { tag: "li", children: ["🤝 Rencontrez des personnes partageant vos passions"] }
          ]
        }
      ]
    },
    // COMMENT CA MARCHE
    {
      tag: "section",
      attributes: [["style", { background: "#f5f7fa", padding: "40px 20px", borderRadius: "24px", maxWidth: "900px", margin: "0 auto 40px auto" }]],
      children: [
        { tag: "h2", attributes: [["style", { color: "#4730DC", fontSize: "1.7rem", marginBottom: "16px" }]], children: ["Comment ça marche ?"] },
        {
          tag: "ol",
          attributes: [["style", { fontSize: "1.1rem", color: "#333", paddingLeft: "20px" }]],
          children: [
            { tag: "li", children: ["Inscrivez-vous ou connectez-vous à la plateforme."] },
            { tag: "li", children: ["Rejoignez une communauté ou créez la vôtre."] },
            { tag: "li", children: ["Participez à des événements et partagez vos expériences."] },
            { tag: "li", children: ["Échangez avec d'autres membres et élargissez votre réseau."] }
          ]
        }
      ]
    },
    // TÉMOIGNAGES
    {
      tag: "section",
      attributes: [["style", { maxWidth: "900px", margin: "0 auto 40px auto", padding: "0 20px" }]],
      children: [
        { tag: "h2", attributes: [["style", { color: "#4730DC", fontSize: "1.7rem", marginBottom: "16px" }]], children: ["Ils nous font confiance"] },
        {
          tag: "div",
          attributes: [["style", { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px" }]],
          children: [
            { tag: "blockquote", attributes: [["style", { background: "#f5f7fa", borderRadius: "12px", padding: "18px", fontStyle: "italic", color: "#333" }]], children: [
              '"Grâce à Meetup Connect, j’ai pu rencontrer des passionnés de photo dans ma ville. Super ambiance !"',
              { tag: "footer", attributes: [["style", { marginTop: "10px", color: "#4730DC", fontWeight: 600 }]], children: ["— Sarah, Paris"] }
            ]},
            { tag: "blockquote", attributes: [["style", { background: "#f5f7fa", borderRadius: "12px", padding: "18px", fontStyle: "italic", color: "#333" }]], children: [
              '"Créer ma propre communauté a été un jeu d’enfant. La plateforme est intuitive et rapide."',
              { tag: "footer", attributes: [["style", { marginTop: "10px", color: "#4730DC", fontWeight: 600 }]], children: ["— Julien, Lyon"] }
            ]},
            { tag: "blockquote", attributes: [["style", { background: "#f5f7fa", borderRadius: "12px", padding: "18px", fontStyle: "italic", color: "#333" }]], children: [
              '"J’adore la diversité des groupes et la facilité pour organiser des événements !"',
              { tag: "footer", attributes: [["style", { marginTop: "10px", color: "#4730DC", fontWeight: 600 }]], children: ["— Amélie, Bordeaux"] }
            ]}
          ]
        }
      ]
    },
    // FAQ
    {
      tag: "section",
      attributes: [["style", { maxWidth: "900px", margin: "0 auto 40px auto", padding: "0 20px" }]],
      children: [
        { tag: "h2", attributes: [["style", { color: "#4730DC", fontSize: "1.7rem", marginBottom: "16px" }]], children: ["Questions fréquentes"] },
        {
          tag: "dl",
          attributes: [["style", { color: "#333", fontSize: "1.05rem" }]],
          children: [
            { tag: "dt", attributes: [["style", { fontWeight: 600, marginTop: "12px" }]], children: ["Est-ce que Meetup Connect est gratuit ?"] },
            { tag: "dd", children: ["Oui, l’inscription et l’utilisation de la plateforme sont 100% gratuites."] },
            { tag: "dt", attributes: [["style", { fontWeight: 600, marginTop: "12px" }]], children: ["Dois-je créer un compte pour explorer ?"] },
            { tag: "dd", children: ["Non, vous pouvez explorer les communautés et événements sans compte, mais il faut s’inscrire pour participer."] },
            { tag: "dt", attributes: [["style", { fontWeight: 600, marginTop: "12px" }]], children: ["Comment mes données sont-elles protégées ?"] },
            { tag: "dd", children: ["Nous utilisons des technologies modernes pour garantir la sécurité et la confidentialité de vos informations."] }
          ]
        }
      ]
    },
    // APPEL FINAL
    {
      tag: "section",
      attributes: [["style", { textAlign: "center", margin: "40px 0 0 0" }]],
      children: [
        { tag: "h2", attributes: [["style", { color: "#4730DC", fontSize: "1.5rem", marginBottom: "12px" }]], children: ["Prêt à rejoindre l'aventure ?"] },
        { tag: Link, attributes: [["link", "/register"], ["title", "Inscription"], ["style", {
          display: "inline-block",
          marginTop: "12px",
          background: "#4f8cff",
          margin: "20px",
          color: "white",
          padding: "14px 36px",
          borderRadius: "30px",
          fontSize: "1.1rem",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(79,140,255,0.10)",
          transition: "background 0.2s"
        }]], children: ["Créer un compte gratuitement"] }
      ]
    }
  ];

  return Layout(content);
} 