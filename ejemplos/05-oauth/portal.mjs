// El portal no pide la contraseña. Passport lleva el navegador a
// /authorize, cambia el code por un access token y lo guarda en la sesión.
// /yo usa ese token para pedir /userinfo: el sub no viene en /token.
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

passport.use(new OAuth2Strategy({
  authorizationURL: 'http://127.0.0.1:4000/authorize',
  tokenURL: 'http://127.0.0.1:4000/token',
  clientID: 'portal',
  clientSecret: 'secreto-lab',
  callbackURL: 'http://127.0.0.1:3002/auth/callback',
  state: true, // el state se guarda en la sesión; por eso la sesión va antes
}, (accessToken, refreshToken, profile, done) => {
  // La estrategia no trae el perfil. La identidad se pide luego a /userinfo.
  done(null, { accessToken });
}));

passport.serializeUser((usuario, done) => done(null, usuario));
passport.deserializeUser((usuario, done) => done(null, usuario));

const app = express();
// saveUninitialized en false: la cookie sale cuando Passport escribe el state, no en una visita vacía
app.use(session({ secret: 'sesion-lab', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth', passport.authenticate('oauth2'));
app.get('/auth/callback',
  passport.authenticate('oauth2', { failureRedirect: '/fallo' }),
  (req, res) => { res.redirect('/yo'); },
);
app.get('/fallo', (req, res) => {
  res.status(401).json({ error: 'oauth' });
});
app.get('/yo', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'sin sesion' });
    return;
  }
  // El Bearer es el de la sesión, no el code de la redirección
  const respuesta = await fetch('http://127.0.0.1:4000/userinfo', {
    headers: { authorization: `Bearer ${req.user.accessToken}` },
  });
  res.json(await respuesta.json());
});

app.listen(3002, () => console.log('portal en 3002'));
