const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Servidor 2 rodando com sucesso!');
});

app.listen(3001, () => {
  console.log('Servidor 2 funcionando em http://localhost:3001');
});