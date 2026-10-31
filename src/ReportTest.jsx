
import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function ReportTest() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendTestReport() {
    setLoading(true);
    setMessage("Өтініш жіберілуде...");

    try {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Алдымен аккаунтқа кіріңіз.");
      }

      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          title: "Qala SOS тест өтініші",
          description: "Supabase байланысын тексеру үшін жіберілген өтініш.",
          category: "Жол мәселесі",
          address: "Алматы қаласы",
          latitude: 43.2389,
          longitude: 76.8897,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      setMessage("✅ Өтініш сақталды! ID: " + data.id);
    } catch (error) {
      setMessage("❌ Қате: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      padding: 20,
      background: "#ffffff",
      borderRadius: 12,
      margin: 20,
      border: "1px solid #dce5dd"
    }}>
      <h3>Supabase өтініш тексеру</h3>

      <button
        type="button"
        onClick={sendTestReport}
        disabled={loading}
        style={{
          padding: 12,
          background: "#174f32",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        {loading ? "Жіберілуде..." : "Тест өтініш жіберу"}
      </button>

      <p>{message}</p>
    </div>
  );
}
