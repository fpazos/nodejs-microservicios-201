// No hay formulario de login: el code es fijo para poder seguir el
// intercambio con curl. El code vuelve por el navegador; el token sale
// en el POST, y /userinfo solo habla con ese Bearer. El sub es la identidad.
import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get('/authorize', (req, res) => {
  // El code se añade al redirect_uri del portal: el navegador vuelve allí
  const destino = new URL(req.query.redirect_uri);
  destino.searchParams.set('code', 'codigo-lab');
  // state tiene que volver igual: el portal rechaza el callback si no cuadra
  destino.searchParams.set('state', req.query.state);
  res.redirect(destino.toString());
});

app.post('/token', (req, res) => {
  // El code visto en el navegador no basta: hace falta el secreto del cliente
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
  // OpenID Connect: sub nombra a la persona. El portal no vio la contraseña.
  res.json({ sub: 'eva', email: 'eva@ejemplo.test' });
});

app.listen(4000, () => console.log('proveedor en 4000'));
