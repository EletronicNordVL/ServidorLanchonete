let produtos = [];
let itensSelecionados = [];
let enviandoPedido = false;
let estoqueAtualizado = false;

const selecionarProduto = document.getElementById('selecionarProduto');
const digitarQuantidade = document.getElementById('digitarQuantidade');
const nomeCliente = document.getElementById('nomeCliente');
const searchInput = document.getElementById('searchInput');
const cardapio = document.getElementById('cardapio');
const detalhesProduto = document.getElementById('detalhesProduto');
const listaItensSelecionados = document.getElementById('itensSelecionados');
const botaoAdicionar = document.getElementById('adicionarProduto');
const botaoEnviar = document.getElementById('enviarPedido');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = texto ? `mensagem ${tipo}` : 'mensagem';
}

function mostrarProdutos(listaProdutos) {
  cardapio.innerHTML = '';

  if (listaProdutos.length === 0) {
    const aviso = document.createElement('p');
    aviso.textContent = 'Nenhum produto encontrado.';
    cardapio.appendChild(aviso);
    return;
  }

  const tabela = document.createElement('table');
  const cabecalho = document.createElement('thead');
  const linhaCabecalho = document.createElement('tr');

  for (const titulo of ['Código', 'Produto', 'Preço', 'Estoque']) {
    const coluna = document.createElement('th');
    coluna.textContent = titulo;
    linhaCabecalho.appendChild(coluna);
  }

  cabecalho.appendChild(linhaCabecalho);
  tabela.appendChild(cabecalho);

  const corpo = document.createElement('tbody');
  for (const produto of listaProdutos) {
    const linha = document.createElement('tr');

    if (produto.Estoque === 0) {
      linha.className = 'sem-estoque';
    }

    const valores = [
      produto.CodProduto,
      produto.NomeProduto,
      `R$ ${produto.Preco.toFixed(2)}`,
      produto.Estoque === 0 ? 'Sem estoque' : produto.Estoque
    ];

    for (const valor of valores) {
      const coluna = document.createElement('td');
      coluna.textContent = valor;
      linha.appendChild(coluna);
    }

    corpo.appendChild(linha);
  }

  tabela.appendChild(corpo);
  cardapio.appendChild(tabela);
}

function atualizarSelecaoProdutos() {
  const codigoSelecionado = selecionarProduto.value;
  selecionarProduto.innerHTML = '';

  const opcaoInicial = document.createElement('option');
  opcaoInicial.value = '';
  opcaoInicial.textContent = 'Selecione um produto';
  selecionarProduto.appendChild(opcaoInicial);

  for (const produto of produtos) {
    const opcao = document.createElement('option');
    opcao.value = produto.CodProduto;
    opcao.textContent = produto.Estoque === 0 ? `${produto.NomeProduto} - sem estoque` : produto.NomeProduto;
    opcao.disabled = produto.Estoque === 0;
    selecionarProduto.appendChild(opcao);
  }

  selecionarProduto.value = codigoSelecionado;
}

function atualizarBotaoEnviar() {
  botaoEnviar.disabled = itensSelecionados.length === 0 || enviandoPedido || !estoqueAtualizado;
}

function validarItensSelecionados() {
  const quantidadeAnterior = itensSelecionados.length;

  itensSelecionados = itensSelecionados.filter(item => {
    const produto = produtos.find(p => p.CodProduto === item.CodProduto);
    return produto && Number.isSafeInteger(item.Qtd) && item.Qtd > 0 && item.Qtd <= produto.Estoque;
  });

  return quantidadeAnterior !== itensSelecionados.length;
}

function mostrarItensSelecionados() {
  listaItensSelecionados.innerHTML = '';

  if (itensSelecionados.length === 0) {
    const aviso = document.createElement('p');
    aviso.textContent = 'Nenhum item selecionado.';
    listaItensSelecionados.appendChild(aviso);
    atualizarBotaoEnviar();
    return;
  }

  const tabela = document.createElement('table');
  const cabecalho = document.createElement('thead');
  const linhaCabecalho = document.createElement('tr');

  for (const titulo of ['Código', 'Produto', 'Quantidade', 'Ação']) {
    const coluna = document.createElement('th');
    coluna.textContent = titulo;
    linhaCabecalho.appendChild(coluna);
  }

  cabecalho.appendChild(linhaCabecalho);
  tabela.appendChild(cabecalho);

  const corpo = document.createElement('tbody');
  for (const item of itensSelecionados) {
    const produto = produtos.find(p => p.CodProduto === item.CodProduto);
    const linha = document.createElement('tr');

    const colunaCodigo = document.createElement('td');
    colunaCodigo.textContent = item.CodProduto;
    linha.appendChild(colunaCodigo);

    const colunaProduto = document.createElement('td');
    colunaProduto.textContent = produto ? produto.NomeProduto : 'Produto não encontrado';
    linha.appendChild(colunaProduto);

    const colunaQuantidade = document.createElement('td');
    const campoQuantidade = document.createElement('input');
    campoQuantidade.type = 'number';
    campoQuantidade.min = 1;
    campoQuantidade.step = 1;
    campoQuantidade.value = item.Qtd;
    campoQuantidade.className = 'quantidade-item';
    campoQuantidade.setAttribute('aria-label', `Quantidade de ${colunaProduto.textContent}`);
    campoQuantidade.disabled = !estoqueAtualizado;

    if (produto) {
      campoQuantidade.max = produto.Estoque;
    }

    colunaQuantidade.appendChild(campoQuantidade);
    linha.appendChild(colunaQuantidade);

    const colunaAcao = document.createElement('td');
    const botaoAtualizarQuantidade = document.createElement('button');
    botaoAtualizarQuantidade.type = 'button';
    botaoAtualizarQuantidade.className = 'botao-atualizar';
    botaoAtualizarQuantidade.textContent = 'Atualizar';
    botaoAtualizarQuantidade.disabled = !estoqueAtualizado;
    botaoAtualizarQuantidade.addEventListener('click', () => {
      const novaQuantidade = Number(campoQuantidade.value);

      if (!produto || !Number.isSafeInteger(novaQuantidade) || novaQuantidade <= 0 || novaQuantidade > produto.Estoque) {
        campoQuantidade.value = item.Qtd;
        mostrarMensagem('Informe uma quantidade inteira dentro do estoque disponível.', 'erro');
        return;
      }

      item.Qtd = novaQuantidade;
      mostrarMensagem('Quantidade atualizada.', 'informacao');
    });

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'botao-remover';
    botaoRemover.textContent = 'Remover';
    botaoRemover.addEventListener('click', () => {
      itensSelecionados = itensSelecionados.filter(p => p.CodProduto !== item.CodProduto);
      mostrarItensSelecionados();
      mostrarMensagem('Produto removido do pedido.', 'informacao');
    });

    colunaAcao.appendChild(botaoAtualizarQuantidade);
    colunaAcao.appendChild(botaoRemover);
    linha.appendChild(colunaAcao);
    corpo.appendChild(linha);
  }

  tabela.appendChild(corpo);
  listaItensSelecionados.appendChild(tabela);
  atualizarBotaoEnviar();
}

async function fetchProdutos() {
  estoqueAtualizado = false;
  selecionarProduto.disabled = true;
  digitarQuantidade.disabled = true;
  botaoAdicionar.disabled = true;
  atualizarBotaoEnviar();
  mostrarItensSelecionados();

  try {
    cardapio.textContent = 'Carregando produtos...';
    const response = await fetch('http://localhost:3001/produtos');
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.error || `Falha ao carregar o cardápio (${response.status}).`);
    }

    produtos = dados;
    const itensRemovidos = validarItensSelecionados();
    estoqueAtualizado = true;
    selecionarProduto.disabled = false;
    digitarQuantidade.disabled = false;
    botaoAdicionar.disabled = false;
    mostrarProdutos(produtos);
    atualizarSelecaoProdutos();
    mostrarItensSelecionados();
    return { sucesso: true, itensRemovidos: itensRemovidos };
  } catch (error) {
    const textoErro = error.message === 'Failed to fetch' ? 'Não foi possível conectar ao servidor de pedidos.' : error.message;
    cardapio.textContent = textoErro;
    atualizarBotaoEnviar();
    console.error('Houve um erro ao buscar os produtos do cardápio:', error);
    return { sucesso: false, itensRemovidos: false };
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

searchInput.addEventListener('input', () => {
  const pesquisa = searchInput.value.trim().toLowerCase();
  const produtosFiltrados = produtos.filter(produto => {
    return produto.NomeProduto.toLowerCase().includes(pesquisa) || String(produto.CodProduto) === pesquisa;
  });

  mostrarProdutos(produtosFiltrados);
});

botaoAdicionar.addEventListener('click', () => {
  const codigoProduto = Number(selecionarProduto.value);
  const quantidade = Number(digitarQuantidade.value);
  const produto = produtos.find(p => p.CodProduto === codigoProduto);

  if (!estoqueAtualizado) {
    mostrarMensagem('Aguarde a atualização do estoque antes de selecionar produtos.', 'erro');
    return;
  }

  if (!produto) {
    mostrarMensagem('Selecione um produto disponível.', 'erro');
    return;
  }

  if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
    mostrarMensagem('Informe uma quantidade inteira válida e maior que zero.', 'erro');
    return;
  }

  const itemExistente = itensSelecionados.find(p => p.CodProduto === codigoProduto);
  const quantidadeFinal = itemExistente ? itemExistente.Qtd + quantidade : quantidade;

  if (!Number.isSafeInteger(quantidadeFinal) || quantidadeFinal > produto.Estoque) {
    mostrarMensagem(`A quantidade solicitada é maior que o estoque disponível (${produto.Estoque}).`, 'erro');
    return;
  }

  if (itemExistente) {
    itemExistente.Qtd = quantidadeFinal;
  } else {
    itensSelecionados.push({ CodProduto: codigoProduto, Qtd: quantidade });
  }

  selecionarProduto.value = '';
  digitarQuantidade.value = 1;
  detalhesProduto.textContent = '';
  mostrarItensSelecionados();
  mostrarMensagem('Produto adicionado ao pedido.', 'sucesso');
});

botaoEnviar.addEventListener('click', async () => {
  const nomeInformado = nomeCliente.value.trim();

  if (nomeInformado.length < 3) {
    mostrarMensagem('O nome do cliente deve ter pelo menos 3 caracteres.', 'erro');
    nomeCliente.focus();
    return;
  }

  if (itensSelecionados.length === 0 || enviandoPedido) {
    mostrarMensagem('Adicione pelo menos um produto ao pedido.', 'erro');
    return;
  }

  if (!estoqueAtualizado) {
    mostrarMensagem('Não é possível enviar o pedido sem informações atualizadas do estoque.', 'erro');
    return;
  }

  const pedido = {
    NomeCliente: nomeInformado,
    Itens: itensSelecionados.map(item => {
      return { CodProduto: item.CodProduto, Qtd: item.Qtd };
    })
  };

  enviandoPedido = true;
  atualizarBotaoEnviar();
  mostrarMensagem('Enviando pedido...', 'informacao');

  try {
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.error || `Não foi possível realizar o pedido (${response.status}).`);
    }

    itensSelecionados = [];
    nomeCliente.value = '';
    mostrarItensSelecionados();
    const confirmacao = `Pedido ${dados.id} realizado com sucesso. Valor total: R$ ${dados.ValorTotal.toFixed(2)}.`;
    mostrarMensagem(confirmacao, 'sucesso');
    const atualizacao = await fetchProdutos();

    if (atualizacao.sucesso) {
      mostrarMensagem(confirmacao, 'sucesso');
    } else {
      mostrarMensagem(`${confirmacao} Não foi possível atualizar o estoque; a seleção de produtos foi bloqueada.`, 'erro');
    }
  } catch (error) {
    const textoErro = error.message === 'Failed to fetch' ? 'Não foi possível conectar ao servidor de pedidos.' : error.message;
    mostrarMensagem(textoErro, 'erro');
    console.error('Houve um erro ao enviar o pedido:', error);
  } finally {
    enviandoPedido = false;
    atualizarBotaoEnviar();
  }
});

mostrarItensSelecionados();
fetchProdutos();
