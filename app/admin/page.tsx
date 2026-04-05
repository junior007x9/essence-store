'use client';

import { useState, useEffect } from 'react';
import { adicionarProduto, buscarProdutos, deletarProduto } from '../actions';

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaAcesso, setSenhaAcesso] = useState('');
  
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]);

  // Carrega produtos apenas se estiver autenticado
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
    // Adiciona a senha de acesso oculta no envio do formulário
    formData.append('senhaAdmin', senhaAcesso); 

    const resposta = await adicionarProduto(formData);

    if (resposta.sucesso) {
      setMensagem('Produto e imagem cadastrados com sucesso!');
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
        if (resposta.erro?.includes('Acesso Negado')) setAutenticado(false);
      }
    }
  }

  // SE NÃO ESTIVER AUTENTICADO: Mostra tela de Login
  if (!autenticado) {
    return (
      <main className="min-h-screen bg-[#f4f1ee] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
           <div className="w-16 h-16 bg-[#330f4a] p-2 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
           </div>
           <h1 className="text-xl font-bold text-gray-800 mb-6">Acesso Restrito</h1>
           <form onSubmit={handleLogin} className="space-y-4">
             <input 
               type="password" 
               required
               placeholder="Digite a senha de administrador" 
               value={senhaAcesso}
               onChange={(e) => setSenhaAcesso(e.target.value)}
               className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center focus:outline-none focus:ring-2 focus:ring-[#330f4a]" 
             />
             <button type="submit" className="w-full bg-[#330f4a] text-white font-bold py-3 rounded-xl transition-colors">Entrar</button>
           </form>
        </div>
      </main>
    );
  }

  // SE ESTIVER AUTENTICADO: Mostra o Painel (Código igual ao anterior)
  return (
    <main className="min-h-screen bg-[#f4f1ee] flex items-start justify-center p-4 md:p-10">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        
        {/* LADO ESQUERDO: O Formulário */}
        <div className="w-full md:w-1/2 bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 h-max">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#330f4a]">Novo Produto</h1>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded w-max mt-1">Sessão Segura</span>
            </div>
            <button onClick={() => setAutenticado(false)} className="text-sm text-gray-500 hover:text-red-500 underline">Sair</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Foto (ImgBB)</label>
              <input required type="file" name="imagem" accept="image/*" className="w-full px-4 py-2 rounded-xl border border-gray-200 cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
              <input required type="text" name="nome" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
              <textarea required name="descricao" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$ 0,00)</label>
                <input required type="text" name="preco" className="w-full px-4 py-3 rounded-xl border border-gray-200" />
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
            <button type="submit" disabled={carregando} className="w-full bg-[#330f4a] hover:bg-[#4a186b] text-white font-bold py-4 rounded-xl transition-colors mt-2">
              {carregando ? 'Processando (Seguro)...' : 'Adicionar à Vitrine'}
            </button>
            {mensagem && <div className={`p-3 rounded-xl text-center text-sm font-semibold ${mensagem.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{mensagem}</div>}
          </form>
        </div>

        {/* LADO DIREITO: Gerenciamento */}
        <div className="w-full md:w-1/2 bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 flex flex-col h-max">
          <h2 className="text-xl font-bold text-[#330f4a] mb-6 border-b pb-4">Gerenciar Produtos</h2>
          <div className="flex-1 overflow-y-auto max-h-[600px] space-y-4 pr-2">
            {listaProdutos.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">Nenhum produto cadastrado.</p>
            ) : (
              listaProdutos.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between border border-gray-100 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                       {produto.imagem_url && <img src={produto.imagem_url} alt="img" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{produto.nome}</h4>
                      <p className="text-xs text-gray-500">{produto.preco} • {produto.categoria}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletar(produto.id)} className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg text-xs font-bold transition-colors">Excluir</button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}