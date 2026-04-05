'use client';

import { useState, useEffect } from 'react';
import { adicionarProduto, buscarProdutos, deletarProduto } from '../actions';

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaAcesso, setSenhaAcesso] = useState('');
  
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]);

  useEffect(() => {
    if (autenticado) {
      carregarLista();
    }
  }, [autenticado]);

  async function carregarLista() {
    const dados = await buscarProdutos();
    setListaProdutos(dados);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaAcesso.trim() !== '') {
      setAutenticado(true);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);
    setMensagem('');

    const formData = new FormData(event.currentTarget);
    formData.append('senhaAdmin', senhaAcesso); 

    const resposta = await adicionarProduto(formData);

    if (resposta.sucesso) {
      setMensagem('Produto cadastrado com sucesso!');
      (event.target as HTMLFormElement).reset(); 
      carregarLista(); 
    } else {
      setMensagem(resposta.erro || 'Erro ao cadastrar.');
      if (resposta.erro?.includes('Acesso Negado')) setAutenticado(false);
    }
    setCarregando(false);
  }

  async function handleDeletar(id: number) {
    if (confirm("Tem certeza que deseja apagar este produto?")) {
      const resposta = await deletarProduto(id, senhaAcesso);
      if (resposta.sucesso) {
        carregarLista(); 
      } else {
        alert(resposta.erro || "Erro ao tentar deletar.");
      }
    }
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-[#f4f1ee] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
           <div className="w-16 h-16 bg-[#330f4a] p-2 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
           </div>
           <h1 className="text-xl font-bold text-gray-800 mb-6">Acesso Administrativo</h1>
           <form onSubmit={handleLogin} className="space-y-4">
             <input 
               type="password" 
               required
               placeholder="Senha da Essence" 
               value={senhaAcesso}
               onChange={(e) => setSenhaAcesso(e.target.value)}
               className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-[#330f4a]" 
             />
             <button type="submit" className="w-full bg-[#330f4a] text-white font-bold py-3 rounded-xl transition-colors">Entrar no Painel</button>
           </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1ee] flex items-start justify-center p-4 md:p-10">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/2 bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border border-gray-100 h-max">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-[#330f4a]">Novo Produto</h1>
            <button onClick={() => setAutenticado(false)} className="text-xs text-red-500 font-bold uppercase tracking-wider">Sair</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CAMPO DE IMAGEM CORRIGIDO: Removido o 'capture' para permitir Galeria */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione a Foto</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden relative">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p className="text-xs text-gray-500 font-medium px-4 text-center">Toque para selecionar da Galeria ou tirar Foto</p>
                  </div>
                  <input 
                    required 
                    type="file" 
                    name="imagem" 
                    accept="image/*"
                    /* Removido o capture="environment" para abrir o menu de escolha */
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto</label>
              <input required type="text" name="nome" placeholder="Ex: Lily Absolu" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição Detalhada</label>
              <textarea required name="descricao" rows={3} placeholder="Conte detalhes sobre o produto..." className="w-full px-4 py-3 rounded-xl border border-gray-200"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$)</label>
                <input required type="text" name="preco" placeholder="128,00" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                <select required name="categoria" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                  <option value="Perfume feminino">Perfume feminino</option>
                  <option value="Perfume masculino">Perfume masculino</option>
                  <option value="Hidratante">Hidratante</option>
                  <option value="Bodysplash">Bodysplash</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={carregando} className="w-full bg-[#330f4a] hover:bg-[#4a186b] text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95">
              {carregando ? 'Enviando...' : 'Publicar na Vitrine'}
            </button>
            {mensagem && <div className={`p-3 rounded-xl text-center text-sm font-semibold ${mensagem.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{mensagem}</div>}
          </form>
        </div>

        <div className="w-full md:w-1/2 bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border border-gray-100 flex flex-col h-max">
          <h2 className="text-xl font-bold text-[#330f4a] mb-6 border-b pb-4">Seu Estoque</h2>
          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-2">
            {listaProdutos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">Aguardando novos produtos...</p>
            ) : (
              listaProdutos.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between border border-gray-100 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={produto.imagem_url} alt="img" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs">{produto.nome}</h4>
                      <p className="text-[10px] text-gray-500">{produto.preco}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletar(produto.id)} className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-red-100">Excluir</button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}