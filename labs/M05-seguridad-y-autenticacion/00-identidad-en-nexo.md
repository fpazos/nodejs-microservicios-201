# Identidad en Nexo

[← Página anterior](README.md) · [Siguiente página →](01-lab-jwt-y-roles.md)

Ana opera el almacén. Luis es el cliente del envío. Los dos llaman al mismo API, y el servicio tiene que saber quién es y qué puede cambiar. El carné de este laboratorio es un JWT firmado con `nexo-lab-secreto`.

## Punto de partida

```bash
mkdir -p ~/nexo/m05-demo && cd ~/nexo/m05-demo
npm init -y
npm pkg set type=module
npm install jsonwebtoken
```

- Node.js 22.
- No hay servidor todavía: esta página solo parte un token para ver qué lleva dentro.

## Recorrido

1. Un script firma el carné de Ana. El payload lleva `sub` y `rol`. La caducidad es de 15 minutos. El secreto `nexo-lab-secreto` es la clave de este laboratorio.

```js
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { sub: 'ana', rol: 'operador' },
  'nexo-lab-secreto',
  { expiresIn: '15m' },
);
console.log(token);
```

2. El texto que imprime tiene tres tramos separados por puntos. El primero es la cabecera (algoritmo y tipo). El segundo es el payload. El tercero es la firma. Cualquiera puede leer los dos primeros: no van cifrados. Lo que no puede hacer sin el secreto es fabricar una firma que el servicio acepte.

3. Al decodificar sin verificar, el payload muestra `sub` igual a `ana`, `rol` igual a `operador`, y los campos `iat` y `exp` que añadió `jsonwebtoken`.

```js
import jwt from 'jsonwebtoken';

const token = process.argv[2];
console.log(jwt.decode(token));
```

4. `jwt.verify(token, 'nexo-lab-secreto')` devuelve el mismo payload. `jwt.verify(token, 'otro-secreto')` lanza un error: la firma no corresponde. Cambiar el rol en el segundo tramo, a mano, también rompe la firma. Por eso el middleware del laboratorio verifica antes de mirar `rol`.

5. Autorizar es el paso siguiente. Ana, con rol `operador`, puede hacer PUT del stock. Luis, con rol `cliente`, puede leer su pedido y recibe 403 si intenta el PUT. El token dice quién es; la ruta dice qué rol entra.

6. Cuando la identidad la guarda otra empresa (Google, Facebook, GitHub), Nexo no firma ese primer carné. El usuario se autentica allí, y Nexo recibe un código que cambia por un token. OpenID Connect es ese intercambio más un identificador estable, el `sub`. El laboratorio lo recorre con un proveedor local que habla el mismo protocolo.

## Qué queda visto

El JWT se lee en claro y se confía solo si la firma cuadra. El laboratorio [01 — JWT y roles](01-lab-jwt-y-roles.md) emite el de Ana y el de Luis y los pone delante de un PUT.
