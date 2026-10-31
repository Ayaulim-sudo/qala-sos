
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (register) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        setMessage(
          data.session
            ? "Тіркелу сәтті аяқталды!"
            : "Email поштаңызды тексеріп, аккаунтты растаңыз."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      }
    } catch (error) {
      setMessage("Қате: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: 14,
    marginTop: 8,
    marginBottom: 18,
    border: "1px solid #dce5dd",
    borderRadius: 10,
    boxSizing: "border-box",
    fontSize: 15,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f8f4",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "white",
        padding: 35,
        borderRadius: 20,
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 10px 35px rgba(0,0,0,.08)",
      }}>
        <h1 style={{ color: "#174f32", textAlign: "center" }}>
          QALA<span style={{ color: "#6aa548" }}>SOS</span>
        </h1>

        <p style={{ textAlign: "center", color: "#718276" }}>
          Қаланы бірге жақсартамыз
        </p>

        <h2>{register ? "Тіркелу" : "Жүйеге кіру"}</h2>

        <form onSubmit={handleSubmit}>
          {register && (
            <label>
              Аты-жөніңіз
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </label>
          )}

          <label>
            Email
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Құпиясөз
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          {message && <p role="status">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 15,
              background: "#174f32",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading
              ? "Күте тұрыңыз..."
              : register ? "Тіркелу" : "Кіру"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          {register
            ? "Аккаунтыңыз бар ма?"
            : "Аккаунтыңыз жоқ па?"}
          {" "}
          <button
            type="button"
            onClick={() => {
              setRegister(!register);
              setMessage("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#16824a",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {register ? "Кіру" : "Тіркелу"}
          </button>
        </p>
      </div>
    </div>
  );
}
