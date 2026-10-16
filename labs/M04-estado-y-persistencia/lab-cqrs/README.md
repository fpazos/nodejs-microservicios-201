# Laboratorio: el GET no lee la tabla

El ejemplo de CQRS ya separa la escritura de la lectura. Aquí el POST guarda el turno en PostgreSQL y el GET lee esa misma tabla, por eso el GET inmediato ya ve `T-1`. Redis está conectado y no se usa. El trabajo es que la consulta lea la copia, y que durante un segundo y medio esa copia todavía no esté.

### Objetivo

201 en el POST, 404 `aun no proyectado` en el GET inmediato, y 200 con `mesa` `4` cuando haya pasado el segundo y medio. La fila sigue en PostgreSQL durante el 404.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M04-estado-y-persistencia/lab-cqrs
docker compose up -d
until docker exec ms-lab-pg pg_isready -U postgres; do sleep 2; done
npm install
npm start
```

```bash
curl -s -w '\n%{http_code}\n' -X POST http://127.0.0.1:3002/turnos
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/turnos/T-1
```

201 y, enseguida, 200. Los dos ven la mesa.

### 1 — Crea `proyeccion.mjs`

**Acción:** crea `proyeccion.mjs` con esto.

```js
export function programar(redis, turno) {
  setTimeout(() => {
    redis.set(`turno:${turno.id}`, JSON.stringify(turno));
  }, 1500);
}

export async function consultar(redis, id) {
  const crudo = await redis.get(`turno:${id}`);
  if (!crudo) return null;
  return JSON.parse(crudo);
}
```

En `server.mjs`, añade el import arriba.

```js
import { programar, consultar } from './proyeccion.mjs';
```

Dentro del POST, después del `upsert` y antes del `res.status(201)`, añade esta línea.

```js
programar(redis, turno);
```

Sustituye el cuerpo del GET por esto.

```js
app.get('/turnos/:id', async (req, res) => {
  const turno = await consultar(redis, req.params.id);
  if (!turno) {
    res.status(404).json({ error: 'aun no proyectado' });
    return;
  }
  res.json(turno);
});
```

Reinicia. Borra una proyección vieja si la hubiera: `docker exec ms-lab-redis redis-cli del turno:T-1`.

```bash
curl -s -w '\n%{http_code}\n' -X POST http://127.0.0.1:3002/turnos
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/turnos/T-1
sleep 2
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/turnos/T-1
docker exec ms-lab-pg psql -U postgres -d turnos -c 'select id, mesa from turnos;'
```

**Por qué:** comando y consulta no pasan por el mismo sitio. El hueco entre los dos es la consistencia eventual. El `select` enseña que el 404 no borró el turno.

**Resultado esperado:** 201, 404 `aun no proyectado`, 200 con `mesa` `4`. El `select` muestra `T-1`.

## Así se ve

201, 404 `aun no proyectado`, 200 con `mesa` `4`. El `select` muestra la fila durante el 404.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Borrar la proyección no borra la fila**
`docker exec ms-lab-redis redis-cli del turno:T-1` y otro GET.
→ 404. El `select` sigue mostrando la fila.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El GET inmediato ya es 200 | Quedó `turno:T-1` de un intento anterior | `redis-cli del turno:T-1` y repite el POST |
| Sigue en 404 después de dos segundos | El `setTimeout` no está en el POST que estás ejecutando | Reinicia `npm start` tras guardar |
