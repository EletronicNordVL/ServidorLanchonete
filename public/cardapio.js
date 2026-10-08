let produtos = [];

const selecionarProduto = document.getElementById('selecionarProduto');
const cardapio = document.getElementById('cardapio');
const detalhesProduto = document.getElementById('detalhesProduto');

function mostrarProdutos() {
  cardapio.innerHTML = '';
  const lista = document.createElement('ul');

  for (const produto of produtos) {
    const itemLista = document.createElement('li');
    itemLista.textContent = `Código: ${produto.CodProduto} - ${produto.NomeProduto} - R$ ${produto.Preco.toFixed(2)} - Estoque: ${produto.Estoque}`;
    lista.appendChild(itemLista);

    const opcao = document.createElement('option');
    opcao.value = produto.CodProduto;
    opcao.textContent = produto.NomeProduto;
    selecionarProduto.appendChild(opcao);
  }

  cardapio.appendChild(lista);
}

async function fetchProdutos() {
  try {
    const response = await fetch('http://localhost:3001/produtos');

    if (!response.ok) {
      throw new Error(`Falha ao carregar o cardápio (${response.status}).`);
    }

    produtos = await response.json();
    mostrarProdutos();
  } catch (error) {
    cardapio.textContent = error.message;
    console.error('Houve um erro ao buscar os produtos do cardápio:', error);
  }
}

selecionarProduto.addEventListener('change', () => {
  const codigoProduto = Number(selecionarProduto.value);
  const produto = produtos.find(p => p.CodProduto === codigoProduto);

  if (!produto) {
    detalhesProduto.textContent = '';
    return;
  }

  detalhesProduto.textContent = `${produto.NomeProduto} - R$ ${produto.Preco.toFixed(2)} - Estoque: ${produto.Estoque}`;
});

fetchProdutos();
