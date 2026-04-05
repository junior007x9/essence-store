'use client';

import { useState } from 'react';

// Funções de formatação e cálculo
function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function extrairPrecoNum(precoString: string) {
  const limpo = precoString.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(limpo) || 0;
}

function calcularPrecos(precoString: string) {
  const precoNum = extrairPrecoNum(precoString);
  if (isNaN(precoNum) || precoNum === 0) return { precoOriginal: precoString, parcela: "Consulte" };
  const precoCartao = precoNum + 10;
  return {
    precoPix: precoString, 
    valorCartaoTotal: formatarPreco(precoCartao),
    parcela: (precoCartao / 3).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  };
}

export default function VitrineCliente({ produtosIniciais }: { produtosIniciais: any[] }) {
  // Número atualizado para o DDD 86
  const whatsappNumber = "5586988508764"; 
  const categorias = ["Todos", "Perfume feminino", "Perfume masculino", "Hidratante", "Bodysplash", "Skincare", "Outros"];
  
  // Estados
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [produtoModal, setProdutoModal] = useState<any | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<'pix' | 'cartao'>('pix');
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  // Filtro
  const produtosFiltrados = categoriaAtiva === "Todos" ? produtosIniciais : produtosIniciais.filter(p => p.categoria === categoriaAtiva);

  const adicionarAoCarrinho = (produto: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setCarrinho([...carrinho, produto]);
    setCarrinhoAberto(true);
  };

  const abrirModalDetalhes = (produto: any) => {
    setProdutoModal(produto);
    setMetodoPagamento('pix');
    document.body.style.overflow = 'hidden'; 
  };

  const fecharModal = () => {
    setProdutoModal(null);
    document.body.style.overflow = 'auto';
  };

  // Função do WhatsApp para Compra Direta
  const enviarParaWhatsAppDireto = () => {
    if (!produtoModal) return;
    const precos = calcularPrecos(produtoModal.preco);
    const formaPagamentoTexto = metodoPagamento === 'pix' 
      ? `no *Pix* (${precos.precoPix})` 
      : `no *Cartão* (em até 3x de ${precos.parcela})`;

    // Texto atualizado com a verificação de disponibilidade
    const mensagem = `Olá Essence! Amei o produto *${produtoModal.nome}* e gostaria de verificar a disponibilidade para finalizar a compra.\n\nForma de pagamento escolhida: ${formaPagamentoTexto}.\nComo prosseguimos?`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // Função do WhatsApp para o Carrinho
  const enviarCarrinhoWhatsApp = () => {
    let mensagem = "Olá Essence! Gostaria de verificar a disponibilidade e finalizar o meu pedido:\n\n";
    let totalPix = 0;
    
    carrinho.forEach(p => {
      mensagem += `• ${p.nome} - ${p.preco}\n`;
      totalPix += extrairPrecoNum(p.preco);
    });
    
    const totalCartao = totalPix + 10;
    
    mensagem += `\n*Total (Pix):* ${formatarPreco(totalPix)}`;
    mensagem += `\n*Total (Cartão):* Até 3x de ${formatarPreco(totalCartao / 3)}`;
    mensagem += `\n\nPodemos confirmar a disponibilidade destes itens?`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Botão Flutuante do Carrinho */}
      <button onClick={() => setCarrinhoAberto(true)} className="fixed bottom-6 right-6 z-[50] bg-[#330f4a] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="font-bold bg-white text-[#330f4a] w-6 h-6 rounded-full flex items-center justify-center text-xs">{carrinho.length}</span>
      </button>

      {/* Sidebar do Carrinho */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative">
            <button onClick={() => setCarrinhoAberto(false)} className="absolute top-4 right-4 text-gray-500 text-2xl">✕</button>
            <div className="p-6 border-b bg-[#330f4a] text-white rounded-bl-xl">
              <h2 className="text-xl font-bold">Meu Pedido</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {carrinho.length === 0 ? <p className="text-center text-gray-500 mt-10">Carrinho vazio.</p> : carrinho.map((item, index) => (
                <div key={index} className="flex gap-4 border-b pb-4 items-center">
                  <img src={item.imagem_url} alt={item.nome} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{item.nome}</h4>
                    <p className="text-[#330f4a] font-bold text-sm">{item.preco}</p>
                  </div>
                  <button onClick={() => { const nc = [...carrinho]; nc.splice(index, 1); setCarrinho(nc); }} className="text-red-400 text-xs font-bold uppercase">Remover</button>
                </div>
              ))}
            </div>
            {carrinho.length > 0 && (
              <div className="p-6 bg-gray-50 border-t rounded-tl-xl">
                {/* Aviso também no carrinho */}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ca8a04" className="shrink-0 mt-0.5" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>
                  <p className="text-[11px] text-yellow-800 leading-tight">Os itens do carrinho estão sujeitos a confirmação de estoque no momento da compra via WhatsApp.</p>
                </div>
                <button onClick={enviarCarrinhoWhatsApp} className="w-full bg-[#330f4a] text-white font-bold py-4 rounded-xl shadow-lg transition-colors">Finalizar Pedido no WhatsApp</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtros da Vitrine */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide justify-start md:justify-center">
          {categorias.map((cat, index) => (
            <button key={index} onClick={() => setCategoriaAtiva(cat)} className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${categoriaAtiva === cat ? 'bg-[#330f4a] text-white shadow-md' : 'bg-white text-gray-700 border border-gray-100 hover:border-[#ebdcd3] hover:text-[#330f4a]'}`}>{cat}</button>
          ))}
        </div>
      </section>

      {/* Grid de Produtos */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {produtosFiltrados.map((produto) => (
            <div 
              key={produto.id} 
              onClick={() => abrirModalDetalhes(produto)}
              className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col border border-gray-50 cursor-pointer group"
            >
              <div className="bg-[#fcfaf9] h-56 rounded-xl mb-5 overflow-hidden relative border border-[#f5ebe6]">
                <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 origin-center" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                   <span className="bg-white/90 text-[#330f4a] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 shadow-md">Ver Detalhes</span>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{produto.nome}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{produto.descricao}</p>
              <div className="font-bold text-[#330f4a] text-2xl mb-5 mt-auto">{produto.preco} <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Pix</span></div>
              
              <div className="flex gap-2">
                <button className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm hover:bg-gray-50">
                  Ver Detalhes
                </button>
                <button onClick={(e) => adicionarAoCarrinho(produto, e)} className="bg-[#ebdcd3] hover:bg-[#d9c5b8] text-[#330f4a] p-2.5 rounded-xl transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 5.5V7h1.5a.5.5 0 0 1 0 1H9v1.5a.5.5 0 0 1-1 0V8H6.5a.5.5 0 0 1 0-1H8V5.5a.5.5 0 0 1 1 0z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL PADRÃO DE DETALHES */}
      {produtoModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md md:p-6 animate-in fade-in duration-300">
          
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-gray-100">
            
            <button onClick={fecharModal} className="fixed md:absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center z-[120] font-bold transition-colors shadow-md">✕</button>
            
            <div className="w-full md:w-[45%] bg-[#fcfaf9] h-[45vh] md:h-auto min-h-[350px] relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#f5ebe6]">
               {produtoModal.imagem_url ? (
                 <img 
                   src={produtoModal.imagem_url} 
                   alt={produtoModal.nome} 
                   className="w-full h-full object-contain drop-shadow-xl" 
                 />
               ) : (
                 <span className="text-[#c2b5ae]">Sem imagem</span>
               )}
            </div>
            
            <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col bg-white overflow-y-auto">
              
              <div className="flex gap-2 mb-3">
                <span className="text-[10px] font-bold text-[#330f4a] bg-[#ebdcd3] px-3 py-1.5 rounded-full uppercase tracking-wider">{produtoModal.categoria}</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight font-serif">{produtoModal.nome}</h2>
              
              <div className="text-gray-600 text-sm mb-6 leading-relaxed whitespace-pre-line max-h-[25vh] overflow-y-auto pr-2">
                {produtoModal.descricao}
              </div>
              
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Selecione a forma de pagamento:</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div 
                  onClick={() => setMetodoPagamento('pix')}
                  className={`cursor-pointer rounded-2xl p-4 md:p-5 border-2 transition-all relative flex flex-col justify-between ${
                    metodoPagamento === 'pix' ? 'border-[#330f4a] bg-[#330f4a]/5' : 'border-gray-200 hover:border-[#ebdcd3] bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500 font-medium">Pagamento no Pix</span>
                    <svg width="24" height="24" viewBox="0 0 32 32" fill={metodoPagamento === 'pix' ? '#330f4a' : '#9ca3af'}>
                       <path d="M10.142 8.783L4.693 14.23c-1.48 1.48-1.48 3.9 0 5.38l5.449 5.449 5.449 5.449c.63.63 1.65.63 2.28 0l5.449-5.449 5.449-5.449c1.48-1.48 1.48-3.9 0-5.38l-5.449-5.449-5.449-5.449c-.63-.63-1.65-.63-2.28 0l-5.449 5.449zm5.858 2.56l2.84 2.84c.96.96.96 2.53 0 3.5l-2.84 2.84-2.84-2.84-2.84-2.84c-.96-.96-.96-2.53 0-3.5l2.84-2.84 2.84-2.84z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-[#330f4a] text-lg md:text-2xl">{calcularPrecos(produtoModal.preco).precoPix}</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">Com Desconto</div>
                  </div>
                </div>

                <div 
                  onClick={() => setMetodoPagamento('cartao')}
                  className={`cursor-pointer rounded-2xl p-4 md:p-5 border-2 transition-all relative flex flex-col justify-between ${
                    metodoPagamento === 'cartao' ? 'border-[#330f4a] bg-[#330f4a]/5' : 'border-gray-200 hover:border-[#ebdcd3] bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500 font-medium">Até 3x no Cartão</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={metodoPagamento === 'cartao' ? '#330f4a' : '#9ca3af'}>
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg md:text-2xl">{calcularPrecos(produtoModal.preco).parcela}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Total: {calcularPrecos(produtoModal.preco).valorCartaoTotal}</div>
                  </div>
                </div>
              </div>

              {/* AVISO DE ESTOQUE ELEGANTE */}
              <div className="mb-5 p-3 bg-[#fdf8f6] border border-[#ebdcd3] rounded-xl flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="var(--brand-purple)" className="shrink-0 text-[#330f4a] mt-0.5" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
                 <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">
                   <strong>Alta demanda:</strong> Nossos estoques são dinâmicos. Ao clicar abaixo, iremos confirmar a disponibilidade do seu produto diretamente pelo WhatsApp.
                 </p>
              </div>

              <button 
                onClick={enviarParaWhatsAppDireto} 
                className="w-full bg-[#330f4a] hover:bg-[#1a0826] text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-3 shadow-lg mt-auto"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.004-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                 Verificar e Finalizar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}