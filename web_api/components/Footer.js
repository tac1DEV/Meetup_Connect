export default function Footer() {
  return {
    tag: "footer",
    attributes: [
      ["class", "footer"],
      ["style", {
        backgroundColor: "#34495e",
        color: "white",
        padding: "2rem 0",
        marginTop: "auto"
      }]
    ],
    children: [
      
        
      {
        tag: "div",
        attributes: [
          ["class", "footer-bottom"],
          ["style", {
            borderTop: "1px solid #4a5f7a",
            marginTop: "2rem",
            paddingTop: "1rem",
            textAlign: "center",
            color: "#95a5a6"
          }]
        ],
        children: [
          {
            tag: "p",
            attributes: [
              ["style", {
                margin: "0"
              }]
            ],
            children: ["© 2024 Meetup Connect. Tous droits réservés."]
          }
        ]
      }
    ]
  };
} 