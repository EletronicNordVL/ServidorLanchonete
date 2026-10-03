async function fetchProdutos() {
  try {
    const response = await fetch('http://localhost:3001/produtos');
    const produtos = await response.json();
    console.log('Produtos do cardápio com informações de estoque:', produtos);
  }
catch (error) {
    console.error('Houve um erro ao buscar os produtos do cardápio:', error);
  }
}
    then(data => {
        console.log('Pedido enviado com sucesso:', data);
    })
    .catch(error => {
        console.error('Houve um erro ao enviar o pedido:', error);
    });

    selecionarProduto.addEventListener('change', () => {
    const produtoSelecionado = selecionarProduto.value;
    const produto = produtos.find(p => p.NomeProduto === produtoSelecionado);
    document.getElementById('produtoSelecionado').textContent = produtoSelecionado;
    if (produto) {
        const precoProduto = produto.Preco;
        const quantidadeProduto = parseInt(digitarQuantidade.value);
        const totalProduto = precoProduto * quantidadeProduto;
        cardapio.innerHTML = `<p>Produto selecionado: ${produtoSelecionado}</p>
                              <p>Preço unitário: R$ ${precoProduto.toFixed(2)}</p>
                              <p>Quantidade: ${quantidadeProduto}</p>
                                <p>Total: R$ ${totalProduto.toFixed(2)}</p>`;
        console.log('Produto selecionado:', produtoSelecionado);
    } else {
        cardapio.innerHTML = `<p>Produto selecionado: ${produtoSelecionado}</p>
                              <p>Produto não encontrado no cardápio.</p>`;
        console.log('Produto selecionado não encontrado no cardápio:', produtoSelecionado);
    }

    fetchProdutos();
});