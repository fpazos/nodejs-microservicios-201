# Laboratorio: el GET no lee la tabla

El ejemplo de CQRS ya separa la comanda. Aquí el POST guarda el turno en PostgreSQL y el GET lee esa misma tabla: por eso el GET inmediato ya ve `T-1`. Redis está conectado y no se usa.

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

### 1 — El POST proyecta un instante después

**Acción:** dentro del POST, después del `upsert` y antes del `res.status(201)`:

```js
setTimeout(() => {
  redis.set('turno:T-1', JSON.stringify(turno));
}, 1500);
```

Reinicia el servidor.

**Por qué:** el 201 significa «la fila está». No significa «quien lee la proyección ya la ve».

**Resultado esperado:** el POST sigue en 201. El GET sigue en 200, porque todavía lee la tabla.

### 2 — El GET solo mira Redis

**Acción:** sustituye el cuerpo del GET por:

```js
const crudo = await redis.get(`turno:${req.params.id}`);
if (!crudo) {
  res.status(404).json({ error: 'aun no proyectado' });
  return;
}
res.json(JSON.parse(crudo));
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

## Comprueba tu entendimiento

**Borrar la proyección no borra la fila**
`docker exec ms-lab-redis redis-cli del turno:T-1` y otro GET.
→ 404. El `select` sigue mostrando la fila.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El GET inmediato ya es 200 | Quedó `turno:T-1` de un intento anterior | `redis-cli del turno:T-1` y repite el POST |
| Sigue en 404 después de dos segundos | El `setTimeout` no está en el POST que estás ejecutando | Reinicia `npm start` tras guardar |
