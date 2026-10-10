const express = require("express");
const app = express();

/* Permitir que as páginas do Servidor 1 acessem esta API */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());

/* Lista de pedidos (Bem simples)*/
let pedidos = [];
let proximoIdPedido = 1;

/* Cardápio com preços (o estoque fica no Servidor 3) */
let cardapio = [
  { CodProduto: 1, NomeProduto: "Hamburguer do Jacquin", Preco: 5 },
  { CodProduto: 2, NomeProduto: "Refrigerante Pepsi-Cola de 350ml", Preco: 3 },
  { CodProduto: 3, NomeProduto: "Batatinha do Fogaça", Preco: 2 },
];

/* Listar tudo do cardápio com informações de estoque */
app.get("/produtos", async (req, res) => {
  try {
    const resposta = await fetch("http://localhost:3002/estoque");

    if (!resposta.ok) {
      return res
        .status(500)
        .json({ error: "Não foi possível consultar o estoque." });
    }

    const dadosEstoque = await resposta.json();

    /* Combinar os dados do cardápio com as informações de estoque */
    const listaCompleta = cardapio.map((prod) => {
      const itemEstoque = dadosEstoque.find(
        (e) => e.CodProduto === prod.CodProduto,
      );
      return {
        CodProduto: prod.CodProduto,
        NomeProduto: prod.NomeProduto,
        Preco: prod.Preco,
        Estoque: itemEstoque ? itemEstoque.Estoque : 0,
      };
    });

    return res.json(listaCompleta);
  } catch (error) {
    console.error("Houve um erro ao buscar os produtos do estoque:", error);
    return res
      .status(500)
      .json({ error: "Não foi possível consultar o estoque." });
  }
});

/* Pedidos (Post) */
app.post("/pedidos/:id/fechar", (req, res) => {
  const idPedido = Number(req.params.id);
  const indicePedido = pedidos.findIndex((p) => p.id === idPedido);

  if (indicePedido < 0) {
    return res.status(404).json({ error: "Pedido não encontrado." });
  }

  const pedidoFechado = pedidos.splice(indicePedido, 1)[0];
  pedidoFechado.status = "Fechado";
  return res.json({
    mensagem: "O pedido foi fechado com sucesso!",
    pedido: pedidoFechado,
  });
});

/* Devolver a lista de pedidos */
app.get("/pedidos", (req, res) => {
  res.json(pedidos);
});

/* Rota dos Pedidos do App.Post */
app.post("/pedidos", async (req, res) => {
  const { NomeCliente, Itens } = req.body || {};

  /* Mostrar um erro na tela se inserir os dados do pedido */
  if (
    typeof NomeCliente !== "string" ||
    !Array.isArray(Itens) ||
    Itens.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Os dados do pedido inserido são inválidos." });
  }

  /* Caso o nome do cliente tiver menos de 3 caracteres, não pode aceitar de jeito nenhum. */
  const nomeClienteValido = NomeCliente.trim();
  if (nomeClienteValido.length < 3) {
    return res
      .status(400)
      .json({ error: "O nome do cliente deve ter pelo menos 3 caracteres." });
  }

  const itensDoPedido = [];

  for (const item of Itens) {
    if (
      !item ||
      !Number.isSafeInteger(item.CodProduto) ||
      item.CodProduto <= 0 ||
      !Number.isSafeInteger(item.Qtd) ||
      item.Qtd <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Os itens do pedido são inválidos." });
    }

    const produtoNoCardapio = cardapio.find(
      (p) => p.CodProduto === item.CodProduto,
    );
    if (!produtoNoCardapio) {
      return res
        .status(404)
        .json({
          error: `O produto com o código ${item.CodProduto} não foi encontrado no cardápio.`,
        });
    }

    const itemExistente = itensDoPedido.find(
      (p) => p.CodProduto === item.CodProduto,
    );
    if (itemExistente) {
      itemExistente.Qtd += item.Qtd;
    } else {
      itensDoPedido.push({
        CodProduto: produtoNoCardapio.CodProduto,
        NomeProduto: produtoNoCardapio.NomeProduto,
        Preco: produtoNoCardapio.Preco,
        Qtd: item.Qtd,
      });
    }
  }

  /* Calcular valor total (VT)*/
  let valorTotal = 0;
  for (const item of itensDoPedido) {
    valorTotal += item.Preco * item.Qtd;
  }

  const itensParaBaixa = itensDoPedido.map((item) => {
    return { CodProduto: item.CodProduto, Qtd: item.Qtd };
  });

  try {
    const respostaBaixa = await fetch("http://localhost:3002/baixa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itensParaBaixa),
    });

    const dadosResposta = await respostaBaixa.json();

    if (!respostaBaixa.ok) {
      return res.status(respostaBaixa.status).json(dadosResposta);
    }

    /* Se o pedido for realizado com sucesso, ele entrará no array de pedidos */
    const novoPedido = {
      id: proximoIdPedido,
      NomeCliente: nomeClienteValido,
      Itens: itensDoPedido,
      ValorTotal: valorTotal,
      status: "Aberto",
    };

    proximoIdPedido++;
    pedidos.push(novoPedido);
    return res.status(201).json(novoPedido);
  } catch (error) {
    console.error("Deu erro ao conectar com o Servidor 3:", error);
    return res
      .status(500)
      .json({ error: "Não foi possível conectar ao servidor de estoque." });
  }
});

/* Tratar JSON inválido recebido nas requisições */
app.use((error, req, res, next) => {
  if (error.status === 400) {
    return res.status(400).json({ error: "O JSON enviado é inválido." });
  }

  next(error);
});

/* Iniciar o Servidor 2 e fazer rodar */
app.listen(3001, () => {
  console.log("Servidor 2 (Pedidos) funcionando em http://localhost:3001");
});
