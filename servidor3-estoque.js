const express = require('express');
const app = express();

app.use(express.json());

let estoque = [
  { CodProduto: 1, NomeProduto: 'Hamburguer do Jacquin', Estoque: 5 },
  { CodProduto: 2, NomeProduto: 'Refrigerante Pepsi-Cola de 350ml', Estoque: 9 },
  { CodProduto: 3, NomeProduto: 'Batatinha do Fogaça', Estoque: 7 }
];

app.post('/reposicao', (req, res) => {
  const itens = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'A lista de itens encontrada é inválida.' });
  }

  for (const item of itens) {
    const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);

    if (!cardapio) {
      return res.status(404).json({ error: `O produto com o código ${item.CodProduto} não foi encontrado no sistema.` });
    }

    cardapio.Estoque += item.Qtd;
  }

  return res.json({ mensagem: 'A reposição foi realizada com sucesso!' });
});

app.get('/estoque', (req, res) => {
  res.json(estoque);
});

/* Dar (Lá ele) baixa no estoque */
app.post('/baixa', (req, res) => {
   const itens = req.body;

   if (!Array.isArray(itens) || itens.length === 0) {
       return res.status(400).json({ error: 'Lista de itens procurada é inválida.' });
   }

   /* Verificar se a quantidade de produtos solicitada é suficiente para o estoque */
for (const item of itens) {
   const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);

if (!cardapio) {
       return res.status(404).json({ error: `O produto com o código ${item.CodProduto} não foi encontrado no sistema.` });
     }
     if (cardapio.Estoque < item.Qtd) {
       return res.status(400).json({ error: 'A quantidade calculada é insuficiente para o estoque.' });
     }
   }

   /* Lógica para dar baixa no estoque */
for (const item of itens) {
     const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);
     cardapio.Estoque -= item.Qtd;
   }

   return res.json({ mensagem: 'A baixa foi realizada com sucesso!' });
   
});

/* Iniciar o Servidor 3 (Estoque) na porta 3002 */
app.listen(3002, () => {
  console.log('O Servidor 3 (Estoque) está funcionando em http://localhost:3002');
});
