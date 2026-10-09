const listaPedidos = document.getElementById('listaPedidos');
const botaoAtualizar = document.getElementById('atualizarPedidos');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = texto ? `mensagem ${tipo}` : 'mensagem';
}

function mostrarPedidos(pedidos) {
  listaPedidos.innerHTML = '';

  if (pedidos.length === 0) {
    const aviso = document.createElement('p');
    aviso.textContent = 'Nenhum pedido em aberto.';
    listaPedidos.appendChild(aviso);
    return;
  }

  for (const pedido of pedidos) {
    const blocoPedido = document.createElement('article');
    blocoPedido.className = 'pedido';

    const titulo = document.createElement('h3');
    titulo.textContent = `Pedido ${pedido.id}`;
    blocoPedido.appendChild(titulo);

    const cliente = document.createElement('p');
    cliente.textContent = `Cliente: ${pedido.NomeCliente}`;
    blocoPedido.appendChild(cliente);

    const total = document.createElement('p');
    total.textContent = `Valor total: R$ ${pedido.ValorTotal.toFixed(2)}`;
    blocoPedido.appendChild(total);

    const tabelaResponsiva = document.createElement('div');
    tabelaResponsiva.className = 'tabela-responsiva';
    const tabela = document.createElement('table');
    const cabecalho = document.createElement('thead');
    const linhaCabecalho = document.createElement('tr');

    for (const texto of ['Código', 'Produto', 'Preço unitário', 'Quantidade']) {
      const coluna = document.createElement('th');
      coluna.textContent = texto;
      linhaCabecalho.appendChild(coluna);
    }

    cabecalho.appendChild(linhaCabecalho);
    tabela.appendChild(cabecalho);

    const corpo = document.createElement('tbody');
    for (const item of pedido.Itens) {
      const linha = document.createElement('tr');
      const valores = [
        item.CodProduto,
        item.NomeProduto,
        `R$ ${item.Preco.toFixed(2)}`,
        item.Qtd
      ];

      for (const valor of valores) {
        const coluna = document.createElement('td');
        coluna.textContent = valor;
        linha.appendChild(coluna);
      }

      corpo.appendChild(linha);
    }

    tabela.appendChild(corpo);
    tabelaResponsiva.appendChild(tabela);
    blocoPedido.appendChild(tabelaResponsiva);

    const botaoFechar = document.createElement('button');
    botaoFechar.type = 'button';
    botaoFechar.className = 'botao-fechar';
    botaoFechar.textContent = 'Fechar pedido';
    botaoFechar.addEventListener('click', () => fecharPedido(pedido.id, botaoFechar));
    blocoPedido.appendChild(botaoFechar);

    listaPedidos.appendChild(blocoPedido);
  }
}

async function carregarPedidos() {
  botaoAtualizar.disabled = true;

  if (!listaPedidos.hasChildNodes()) {
    listaPedidos.textContent = 'Carregando pedidos...';
  }

  try {
    const response = await fetch('http://localhost:3001/pedidos');
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.error || `Não foi possível carregar os pedidos (${response.status}).`);
    }

    mostrarPedidos(dados);
    return true;
  } catch (error) {
    if (listaPedidos.textContent === 'Carregando pedidos...') {
      listaPedidos.textContent = '';
    }
    const textoErro = error.message === 'Failed to fetch' ? 'Não foi possível conectar ao servidor de pedidos.' : error.message;
    mostrarMensagem(textoErro, 'erro');
    console.error('Houve um erro ao carregar os pedidos:', error);
    return false;
  } finally {
    botaoAtualizar.disabled = false;
  }
}

async function fecharPedido(idPedido, botaoFechar) {
  botaoFechar.disabled = true;
  mostrarMensagem(`Fechando o pedido ${idPedido}...`, 'informacao');

  try {
    const response = await fetch(`http://localhost:3001/pedidos/${idPedido}/fechar`, {
      method: 'POST'
    });
    const dados = await response.json();

    if (!response.ok) {
      throw new Error(dados.error || `Não foi possível fechar o pedido (${response.status}).`);
    }

    const blocoPedido = botaoFechar.closest('.pedido');
    if (blocoPedido) {
      blocoPedido.remove();
    }

    const listaAtualizada = await carregarPedidos();
    if (listaAtualizada) {
      mostrarMensagem(`Pedido ${idPedido} fechado com sucesso.`, 'sucesso');
    } else {
      mostrarMensagem(`Pedido ${idPedido} fechado com sucesso. Não foi possível atualizar a lista de pedidos.`, 'erro');
    }
  } catch (error) {
    botaoFechar.disabled = false;
    const textoErro = error.message === 'Failed to fetch' ? 'Não foi possível conectar ao servidor de pedidos.' : error.message;
    mostrarMensagem(textoErro, 'erro');
    console.error('Houve um erro ao fechar o pedido:', error);
  }
}

botaoAtualizar.addEventListener('click', () => {
  mostrarMensagem('', '');
  carregarPedidos();
});

carregarPedidos();
