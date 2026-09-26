const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Servidor 3 rodando com sucesso!');
});

app.listen(3002, () => {
  console.log('Servidor 3 funcionando em http://localhost:3002');
});