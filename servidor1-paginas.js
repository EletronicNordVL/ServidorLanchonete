const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Servidor 1 rodando com sucesso!');
});

app.listen(3000, () => {
  console.log('Servidor 1 funcionando em http://localhost:3000');
});