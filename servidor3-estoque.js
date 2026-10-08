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

  const itensAgrupados = [];

  for (const item of itens) {
    if (!item || typeof item.CodProduto !== 'number' || item.CodProduto <= 0 || item.CodProduto % 1 !== 0 ||
        typeof item.Qtd !== 'number' || item.Qtd <= 0 || item.Qtd % 1 !== 0) {
      return res.status(400).json({ error: 'Os itens da reposição são inválidos.' });
    }

    const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);

    if (!cardapio) {
      return res.status(404).json({ error: `O produto com o código ${item.CodProduto} não foi encontrado no sistema.` });
    }

    const itemExistente = itensAgrupados.find(p => p.CodProduto === item.CodProduto);
    if (itemExistente) {
      itemExistente.Qtd += item.Qtd;
    } else {
      itensAgrupados.push({ CodProduto: item.CodProduto, Qtd: item.Qtd });
    }
  }

  for (const item of itensAgrupados) {
    const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);
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

   const itensAgrupados = [];

   /* Ver se a quantidade de comida é suficiente para o estoque */
for (const item of itens) {
     if (!item || typeof item.CodProduto !== 'number' || item.CodProduto <= 0 || item.CodProduto % 1 !== 0 ||
         typeof item.Qtd !== 'number' || item.Qtd <= 0 || item.Qtd % 1 !== 0) {
       return res.status(400).json({ error: 'Os itens da baixa são inválidos.' });
     }

     const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);

     if (!cardapio) {
       return res.status(404).json({ error: `O produto com o código ${item.CodProduto} não foi encontrado no sistema.` });
     }

     const itemExistente = itensAgrupados.find(p => p.CodProduto === item.CodProduto);
     if (itemExistente) {
       itemExistente.Qtd += item.Qtd;
     } else {
       itensAgrupados.push({ CodProduto: item.CodProduto, Qtd: item.Qtd });
     }
   }

for (const item of itensAgrupados) {
     const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);
     if (cardapio.Estoque < item.Qtd) {
       return res.status(400).json({ error: 'A quantidade calculada é insuficiente para o estoque.' });
     }
   }

   /* Lógica para dar baixa no estoque */
for (const item of itensAgrupados) {
     const cardapio = estoque.find(p => p.CodProduto === item.CodProduto);
     cardapio.Estoque -= item.Qtd;
   }

   return res.json({ mensagem: 'A baixa foi realizada com sucesso, meu nobre!' });
   
});

/* Iniciar o Servidor 3 (Estoque) na porta 3002 */
app.listen(3002, () => {
  console.log('O Servidor 3 (Estoque) está funcionando em http://localhost:3002');
});
