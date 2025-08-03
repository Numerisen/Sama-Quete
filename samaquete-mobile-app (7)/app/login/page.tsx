import React from "react";

export default function AdminLoginPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h1>Connexion Administrateur</h1>
      <form style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 300 }}>
        <label>
          Email
          <input type="email" name="email" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <label>
          Mot de passe
          <input type="password" name="password" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <button type="submit" style={{ padding: 10, marginTop: 12, background: "#222", color: "#fff", border: "none", borderRadius: 4 }}>
          Se connecter
        </button>
      </form>
    </div>
  );
} 