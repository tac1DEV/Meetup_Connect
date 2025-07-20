import { supabase } from "../../config.js";
import { BrowserLink } from "../components/BrowserRouter.js";

export default async function AboutPage() {
  const data = await supabase.query("utilisateur"); // depuis Supabase
  return {
    tag: "div",
    children: [
      {
        tag: BrowserLink,
        attributes: [
          ["link", "/home"],
          ["title", "HomePage"],
        ],
      },
      {
        tag: BrowserLink,
        attributes: [
          ["link", "/gallery"],
          ["title", "Gallery"],
        ],
      },
      {
        tag: "div",
        // children: data.map((d) => ({ tag: "p", children: [d.nom] })),
        children: data.flatMap((d) =>
          Object.entries(d).map(([key, value]) => ({
            tag: "p",
            children: [`${key}: ${String(value ?? "")}`],
          }))
        ),
      },
    ],
  };
}
