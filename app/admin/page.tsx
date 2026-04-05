'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { adicionarProduto, buscarProdutos, deletarProduto } from '../actions';

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaAcesso, setSenhaAcesso] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (autenticado) carregarLista();
  }, [autenticado]);

  async function carregarLista() {
    const dados = await buscarProdutos();
    setListaProdutos(dados);
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaAcesso.trim() !== '') setAutenticado(true);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);
    setMensagem('');
    const formData = new FormData(event.currentTarget);
    formData.append('senhaAdmin', senhaAcesso); 
    const resposta = await adicionarProduto(formData);
    if (resposta.sucesso) {
      setMensagem('✅ Sucesso!');
      setPreviewUrl(null);
      (event.target as HTMLFormElement).reset(); 
      carregarLista(); 
    } else {
      setMensagem('❌ ' + (resposta.erro || 'Erro.'));
    }
    setCarregando(false);
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#f4f1ee] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-200">
          <h1 className="text-xl font-bold text-center mb-6 text-black">Acesso Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" required placeholder="Senha" 
              value={senhaAcesso} onChange={(e) => setSenhaAcesso(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-black text-center" 
            />
            <button className="w-full bg-[#330f4a] text-white py-3 rounded-xl font-bold">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ee] p-4 md:p-10 text-black">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* FORMULÁRIO */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Novo Produto</h2>
            <button onClick={() => setAutenticado(false)} className="text-red-600 text-sm font-bold uppercase">Sair</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center relative hover:bg-gray-100 transition-all">
              {previewUrl ? (
                <img src={previewUrl} className="h-32 mx-auto rounded-lg object-contain" alt="Preview" />
              ) : (
                <p className="text-xs font-bold text-gray-500 uppercase py-4">Toque para selecionar a foto</p>
              )}
              <input required type="file" name="imagem" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <input required type="text" name="nome" placeholder="Nome do Produto" className="w-full p-3 rounded-xl border border-gray-300 bg-white" />
            <textarea required name="description" rows={2} placeholder="Descrição curta" className="w-full p-3 rounded-xl border border-gray-300 bg-white"></textarea>
            
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" name="preco" placeholder="Preço (Ex: 128,00)" className="w-full p-3 rounded-xl border border-gray-300 bg-white" />
              <select name="categoria" className="w-full p-3 rounded-xl border border-gray-300 bg-white">
                <option value="Perfume feminino">Feminino</option>
                <option value="Perfume masculino">Masculino</option>
                <option value="Hidratante">Hidratante</option>
                <option value="Bodysplash">Bodysplash</option>
                <option value="Skincare">Skincare</option>
              </select>
            </div>

            <button type="submit" disabled={carregando} className="w-full bg-[#330f4a] text-white py-4 rounded-xl font-bold shadow-md active:scale-95 transition-all">
              {carregando ? 'Publicando...' : 'Publicar Produto'}
            </button>
            {mensagem && <p className="text-center text-sm font-bold mt-2">{mensagem}</p>}
          </form>
        </div>

        {/* LISTA LADO DIREITO */}
        <div className="w-full md:w-1/2 bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Lista de Itens</h2>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {listaProdutos.map((p) => (
              <div key={p.id} className="flex items-center gap-4 border-b pb-3">
                <img src={p.imagem_url} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="prod" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm leading-tight">{p.nome}</h4>
                  <p className="text-xs text-[#330f4a] font-bold">{p.preco}</p>
                </div>
                <button onClick={() => deletarProduto(p.id, senhaAcesso).then(carregarLista)} className="text-red-500 font-bold text-xs uppercase">Excluir</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}