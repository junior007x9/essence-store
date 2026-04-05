'use server';

import { turso } from "../lib/turso"; 
import { revalidatePath } from "next/cache";

const validarSenha = (senha: string) => {
  return senha === process.env.ADMIN_PASSWORD;
};

export async function adicionarProduto(formData: FormData) {
  const senha = formData.get('senhaAdmin') as string;
  
  if (!validarSenha(senha)) {
    return { sucesso: false, erro: "Acesso Negado: Senha incorreta." };
  }

  const nome = formData.get('nome') as string;
  const descricao = formData.get('descricao') as string;
  const preco = formData.get('preco') as string;
  const categoria = formData.get('categoria') as string;
  const imagem = formData.get('imagem') as File; 

  if (!nome || !preco || !categoria) {
    return { sucesso: false, erro: "Dados incompletos. Preencha os campos obrigatórios." };
  }

  let imagem_url = "";

  try {
    if (imagem && imagem.size > 0) {
      if (imagem.size > 5 * 1024 * 1024) {
        return { sucesso: false, erro: "A imagem é muito grande. O limite é 5MB." };
      }

      const imgbbData = new FormData();
      imgbbData.append('image', imagem);
      
      const apiKey = process.env.IMGBB_API_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: imgbbData,
      });
      
      const data = await res.json();
      if (data.success) {
        imagem_url = data.data.url; 
      } else {
        return { sucesso: false, erro: "Erro no servidor de imagens (ImgBB)." };
      }
    }

    await turso.execute({
      sql: "INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url) VALUES (?, ?, ?, ?, ?)",
      args: [nome.trim(), descricao.trim(), preco.trim(), categoria, imagem_url],
    });
    
    revalidatePath('/'); 
    return { sucesso: true };
  } catch (erro) {
    console.error(erro);
    return { sucesso: false, erro: "Falha de comunicação com o banco de dados." };
  }
}

export async function buscarProdutos() {
  try {
    const { rows } = await turso.execute("SELECT * FROM produtos ORDER BY id DESC");
    return JSON.parse(JSON.stringify(rows));
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    return [];
  }
}

export async function deletarProduto(id: number, senhaAdmin: string) {
  if (!validarSenha(senhaAdmin)) {
    return { sucesso: false, erro: "Acesso Negado: Senha incorreta." };
  }

  try {
    await turso.execute({
      sql: "DELETE FROM produtos WHERE id = ?",
      args: [id],
    });
    revalidatePath('/'); 
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: "Falha ao apagar produto no banco." };
  }
}