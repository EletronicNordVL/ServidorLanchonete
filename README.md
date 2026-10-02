[README.md](https://github.com/user-attachments/files/32940325/README.md)
# 🍔 Sistema de Lanchonete - Arquitetura de Servidores Node.js

Esse é um projeto acadêmico desenvolvido para a disciplina de **Sistemas Web** (Trabalho N1). O objetivo principal é implementar uma arquitetura web distribuída e desacoplada, dividida em três servidores independentes executando como processos separados no Node.js e com a utilização do Express.

---

## 📐 Arquitetura do Sistema

Vai funcionar da seguinte maneira: A aplicação segue estritamente a arquitetura em camadas e o fluxo de dados será unidirecional.

```
[ Navegador ] ---- (1) GET ----> [ Servidor 1: Páginas Estáticas (Porta 3000) ]
      |
      +---------- (2) Fetch ----> [ Servidor 2: API de Pedidos (Porta 3001) ]
                                            |
                                            +-- (3) Fetch --> [ Servidor 3: API de Estoque (Porta 3002) ]
```

### 🎯 Regra Central de Isolamento
> **O navegador não acessa o Servidor 3 em nenhuma hipótese.** Todas as informações e validações de estoque passam obrigatoriamente pelo Servidor 2 antes de chegar ao front-end.

---

## 🚀 Servidores e Responsabilidades

### 🌐 Servidor 1: Conteúdo Estático (`servidor1-paginas.js`)
* **Porta:** `3000`
* **Função:** Entregar as páginas HTML, CSS e scripts front-end para o navegador.
* **Regra:** Não contém regras de negócio ou dados fixos no HTML.
* **Páginas Servidas:**
  * **Cardápio (`/`):** Exibe a lista de produtos carregada dinamicamente via Fetch e permite a seleção de itens e informe do nome do cliente.
  * **Pedidos (`/pedidos.html`):** Exibe a lista de pedidos abertos com calculo de totais e botão de atualização.

### 🛒 Servidor 2: API de Negócio (`servidor2-pedidos.js`)
* **Porta:** `3001`
* **Função:** Gerenciar produtos, preços e pedidos em memória. É a única API acessada pelo front-end.
* **Rotas:**
  * `GET /produtos` — Retorna os produtos combinando preços locais com o estoque obtido do Servidor 3.
  * `POST /pedidos` — Registra um novo pedido após consultar a disponibilidade no Servidor 3 e calcular o valor total.
  * `GET /pedidos` — Retorna a lista de pedidos ativos.
  * `POST /pedidos/:id/fechar` — Finaliza e remove um pedido da lista.

### 📦 Servidor 3: API de Estoque (`servidor3-estoque.js`)
* **Porta:** `3002`
* **Função:** Terá o controle isolado de estoque dos ingredientes/produtos em memória.
* **Rotas:**
  * `GET /estoque` — Situação atual do estoque (Código, Nome, Quantidade).
  * `POST /baixa` — Realiza a baixa de itens com **operação atômica** (se um item não tiver quantidade suficiente, o pedido inteiro é recusado).
  * `POST /reposicao` — Recompõe o estoque para testes.

---

## 🛠️ Tecnologias e Ferramentas

* **Runtime:** Node.js
* **Framework Web:** Express.js (`v5.x`)
* **Live Reloading:** Nodemon (`v3.x`)
* **Front-end:** HTML5, CSS3 e JavaScript Vanilla (Fetch API nativa)

---

## 🏁 Como Executar o Projeto

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie os 3 servidores em terminais separados no VSCode:**

   * **Terminal 1 (Servidor 1 - Páginas):**
     ```bash
     npm run s1
     ```
   * **Terminal 2 (Servidor 2 - Pedidos):**
     ```bash
     npm run s2
     ```
   * **Terminal 3 (Servidor 3 - Estoque):**
     ```bash
     npm run s3
     ```

3. **Acesse a aplicação no navegador:**
   * Cardápio: `http://localhost:3000`

---

## 👥 Autores

Trabalho desenvolvido em dupla para a N1 de Sistemas Web.
