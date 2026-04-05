import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Teste de conexão silencioso para garantir que o banco está ativo
export async function testConnection() {
  try {
    await turso.execute("SELECT 1");
    return true;
  } catch (e) {
    console.error("Erro crítico de conexão com o banco:", e);
    return false;
  }
}