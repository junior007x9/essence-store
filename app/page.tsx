import { turso, testConnection } from "../lib/turso";
import VitrineCliente from "./VitrineCliente";
import SeguidoresCounter from "../components/SeguidoresCounter";

export const revalidate = 60; 

export default async function Home() {
  // Testa a conexão para garantir estabilidade
  await testConnection();

  const { rows } = await turso.execute("SELECT * FROM produtos ORDER BY id DESC");
  
  // Limpa os dados do banco para o Next.js aceitar sem erros
  const produtos = JSON.parse(JSON.stringify(rows));

  return (
    <main className="min-h-screen bg-[#f4f1ee] font-sans pb-10 relative">
      
      <nav className="bg-[#330f4a] text-white py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative overflow-hidden rounded-md bg-white p-1 shadow">
             <img src="/logo.jpeg" alt="Logo Essence" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm tracking-widest uppercase font-semibold hidden md:inline">Essence</span>
        </div>
        
        <ul className="flex flex-wrap justify-center gap-6 text-sm font-light hidden lg:flex">
          <li className="cursor-pointer hover:text-[#ebdcd3] transition-colors">Produtos</li>
          <li className="cursor-pointer hover:text-[#ebdcd3] transition-colors">Contato</li>
        </ul>

        <SeguidoresCounter />
      </nav>

      <section className="bg-[#330f4a] rounded-b-[3rem] shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        <div className="w-32 h-32 md:w-44 md:h-44 mb-5 relative z-10">
           <img src="/logo.jpeg" alt="Logo Essence Grande" className="w-full h-full object-cover rounded-3xl shadow-2xl ring-4 ring-white/10" />
        </div>
        <h1 className="text-white text-3xl md:text-5xl font-light tracking-[0.4em] uppercase z-10">Essence</h1>
      </section>

      <VitrineCliente produtosIniciais={produtos} />
      
      <footer className="bg-[#330f4a] text-white py-12 rounded-t-3xl text-center mt-10">
         <span className="text-sm tracking-widest uppercase font-semibold">Essence</span>
         <div className="text-xs text-white/50 mt-4 font-light">&copy; 2026 Essence.</div>
      </footer>
    </main>
  );
}