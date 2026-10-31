
import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function SupabaseTest() {
  const [result, setResult] = useState("");

  async function checkConnection() {
    setResult("Тексерілуде...");

    const { error } = await supabase
      .from("reports")
      .select("id")
      .limit(1);

    if (error) {
      setResult("Қате: " + error.message);
    } else {
      setResult("✅ Supabase қосылымы жұмыс істейді!");
    }
  }

  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      margin: "20px"
    }}>
      <h3>Supabase тексеру</h3>

      <button onClick={checkConnection}>
        Деректер базасын тексеру
      </button>

      <p>{result}</p>
    </div>
  );
}
