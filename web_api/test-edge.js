import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wxfruxhckurswdcbdxwq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZnJ1eGhja3Vyc3dkY2JkeHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzM0OTksImV4cCI6MjA2NTgwOTQ5OX0.OztdaAYi3kRHhXmPwhmQCH7emQAkyYk-2R5io6M-8es";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const run = async () => {
  const { data, error } = await supabase.functions.invoke("CRUD", {
    body: { name: "Functions" },
  });

  if (error) console.error("Erreur:", error);
  else console.log("Succès:", data);
};

run();
