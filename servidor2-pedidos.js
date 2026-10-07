const express = require('express');
const app = express();

app.use(express.json());

/* Lista de pedidos*/
let pedidos = [];

/* Listar os produtos do cardápio com informações de estoque */
let cardapio = [
  { CodProduto: 1, NomeProduto: 'Hamburguer do Jacquin', Preco: 5 },
  { CodProduto: 2, NomeProduto: 'Refrigerante Pepsi-Cola de 350ml', Preco: 3 },
  { CodProduto: 3, NomeProduto: 'Batatinha do Fogaça', Preco: 2 }
];

/* Rota de listar os produtos do cardápio com informações de estoque */
app.get('/produtos', async (req, res) => {
 try {
      const resposta = await fetch('http://localhost:3002/estoque'); 
      const dadosEstoque = await resposta.json();

/* Combinar os dados do cardápio com as informações de estoque */
const listaCompleta = cardapio.map(prod => {
  const itemEstoque = dadosEstoque.find(e => e.CodProduto === prod.CodProduto);
  return { 
    CodProduto: prod.CodProduto,
    NomeProduto: prod.NomeProduto,
    Preco: prod.Preco,
    Estoque: itemEstoque ? itemEstoque.Estoque : 0
  };
});

      return res.json(listaCompleta);
  }

catch (error) {
      console.error('Houve um erro bizarro ao buscar os produtos do estoque:', error);
      return res.status(500).json({ error: 'Houve um erro bizarro ao buscar os produtos do estoque.' });
}
  });

  /* Rota dos Pedidos (Post) */
app.post('/pedidos/:id/fechar', (req, res) => {
  const idPedido = parseInt(req.params.id);
  const pedido = pedidos.find(p => p.id === idPedido);

  if (!pedido) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  } 
  pedido.status = 'Fechado';
  return res.json({ mensagem: 'O pedido foi fechado com sucesso, meu nobre!', pedido });
});

/* Rota para devolver a lista de pedidos */
app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

/* Rota dos Pedidos do App.Post */
app.post('/pedidos', async (req, res) => {
    const { NomeCliente, Itens } = req.body;
    
    /* Mostrar um erro na tela se inserir os dados do pedido */
    if (!NomeCliente || !Array.isArray(Itens) || Itens.length === 0) {
      return res.status(400).json({ error: 'Os dados do pedido inserido são inválidos.' });
    }

  /* Caso o nome do cliente tiver menos de 3 caracteres, o sistema não pode aceitar */
   if (NomeCliente.length < 3) {
      return res.status(400).json({ error: 'O nome do cliente deve ter pelo menos 3 caracteres.' });
   }

   /* Cálculo do Valor Total (VT)*/
      let valorTotal = 0;
      for (const item of Itens) {
        const produtoNoCardapio = cardapio.find(p => p.CodProduto === item.CodProduto);
        if (produtoNoCardapio) {
          valorTotal += produtoNoCardapio.Preco * item.Qtd;
        }
      }
     
     try {
      const respostaBaixa = await fetch('http://localhost:3002/baixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Itens)
      });

      const dadosResposta = await respostaBaixa.json();

      if (!respostaBaixa.ok) {
        return res.status(respostaBaixa.status).json(dadosResposta);
      }

      /* Se o pedido for realizado com sucesso, ele será adicionado ao array de pedidos */
        const novoPedido = {
      id: pedidos.length + 1,
      NomeCliente,
      Itens,
      ValorTotal: valorTotal,
      status: 'Aberto'
        };

        pedidos.push(novoPedido); 
        return res.status(201).json(novoPedido);

        } catch (error) {
      console.error('Erro ao conectar com o Servidor 3:', error);
      return res.status(500).json({ error: 'Não foi possível conectar ao servidor de estoque.' });
    }
  });

    /* Iniciar o Servidor 2 e fazer rodar */
  app.listen(3001, () => {
  console.log('Servidor 2 (Pedidos) funcionando em http://localhost:3001');
});