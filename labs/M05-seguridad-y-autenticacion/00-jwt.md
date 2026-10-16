# JWT y roles

[← CQRS](../M04-estado-y-persistencia/03-cqrs.md) · [Siguiente página →](01-oauth.md)

El token dice quién llama y qué rol trae. Lo firma el servicio con un secreto. Quien lo recibe comprueba la firma: si no cuadra con `secreto-articulos`, el token no vale. El cuerpo del token se puede leer sin el secreto. La firma es lo que impide inventárselo.

Tres resultados distintos:

| Llamada | Código | Qué ha pasado |
|---------|--------|----------------|
| Sin cabecera `Authorization` | 401 | No hay identidad |
| Token de `leo`, rol `lector`, en el PUT | 403 | La identidad es válida y ese rol no cambia el artículo |
| Token de `eva`, rol `editor`, en el PUT | 200 | Cambia el título |

La clave de las dos cuentas es `lab`. 401 y 403 no se intercambian: uno es «no sé quién eres» y el otro es «sé quién eres y no entras».

El GET del artículo, en el ejemplo, también exige token. Sin él responde 401. El título que queda después del PUT de `eva` es `publicado`.

## Ejemplo

La demostración está en [JWT y roles](../../ejemplos/05-jwt/README.md). El PUT de `eva` responde 200. El de `leo` responde 403. Un GET sin token responde 401.

## Laboratorio

[Recetas](lab-jwt/README.md). `GET` y `PUT` de `/recetas/r1` están abiertos. Las cuentas ya existen: `noa` es `chef`, `ian` es `comensal`, la clave es `lab` y el secreto es `secreto-recetas`. Falta `POST /sesion` y el middleware que exige el rol. El cambio del plato queda para `chef`.
