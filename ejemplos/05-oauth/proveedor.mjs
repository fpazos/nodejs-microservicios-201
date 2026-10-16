import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get('/authorize', (req, res) => {
  const destino = new URL(req.query.redirect_uri);
  destino.searchParams.set('code', 'codigo-lab');
  destino.searchParams.set('state', req.query.state);
  res.redirect(destino.toString());
});

app.post('/token', (req, res) => {
  if (req.body.code !== 'codigo-lab' || req.body.client_secret !== 'secreto-lab') {
    res.status(400).json({ error: 'invalid_grant' });
    return;
  }
  res.json({ access_token: 'token-eva', token_type: 'Bearer' });
});

app.get('/userinfo', (req, res) => {
  if (req.header('authorization') !== 'Bearer token-eva') {
    res.status(401).end();
    return;
  }
  res.json({ sub: 'eva', email: 'eva@ejemplo.test' });
});

app.listen(4000, () => console.log('proveedor en 4000'));
