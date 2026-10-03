const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Servidor 1 (Páginas Estáticas) está rodando com sucesso!');
});

app.listen(3000, () => {
  console.log('Servidor 1 (Páginas Estáticas) funcionando em http://localhost:3000');
});