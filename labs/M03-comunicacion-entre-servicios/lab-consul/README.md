# Laboratorio: descubrir prefijos en Consul

El ejemplo de Consul ya registra `reloj` y el cliente no conoce el puerto. Aquí `prefijos` responde en el 3001 y no se registra. `cliente.mjs` llama a ese puerto escrito a mano.

La UI de Consul es http://127.0.0.1:8500. El check de salud usa el nombre Docker `prefijos`. La dirección que ve tu terminal es `127.0.0.1`, porque el puerto está publicado en el host.

### Objetivo

Ver el servicio `prefijos` en passing y que `cliente.mjs` imprima `descubierto` usando la dirección que devuelve Consul, no la URL fija.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M03-comunicacion-entre-servicios/lab-consul
docker compose up --build -d
curl -s http://127.0.0.1:3001/codigo
echo
node cliente.mjs
```

`/codigo` devuelve `{"codigo":"+34"}`. El cliente imprime `directo`. En la UI de Consul no hay servicio `prefijos`.

### 1 — Crea `prefijos/registro.mjs` y llámalo al escuchar

**Acción:** crea `prefijos/registro.mjs` con esto.

```js
export async function registrar(consul) {
  const respuesta = await fetch(`${consul}/v1/agent/service/register`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      Name: 'prefijos',
      ID: 'prefijos-1',
      Address: '127.0.0.1',
      Port: 3001,
      Check: { HTTP: 'http://prefijos:3001/salud', Interval: '5s' },
    }),
  });
  if (!respuesta.ok) throw new Error(`registro ${respuesta.status}`);
  console.log('registrado');
}
```

En `prefijos/server.mjs`, añade el import arriba y sustituye el `listen` por este. El callback pasa a ser `async` para poder usar `await`.

```js
import { registrar } from './registro.mjs';
```

```js
app.listen(3001, '0.0.0.0', async () => {
  console.log('prefijos en 3001');
  await registrar(consul);
});
```

Reconstruye:

```bash
docker compose up --build -d
docker logs ms-lab-prefijos
```

**Por qué:** Consul es el listín. Sin el PUT, el resto de servicios solo pueden usar una dirección que alguien les ha contado.

**Resultado esperado:** el log dice `registrado`. En http://127.0.0.1:8500 el servicio `prefijos` pasa a passing en unos segundos. `Address` es `127.0.0.1` para que tu terminal pueda llamar. El check usa `prefijos` porque Consul está en la red de Compose, donde ese nombre existe.

### 2 — Llama a quien Consul diga

**Acción:** sustituye el cuerpo de `cliente.mjs` por esto.

```js
const consul = process.env.CONSUL_HTTP_ADDR || 'http://127.0.0.1:8500';

const listaRes = await fetch(`${consul}/v1/health/service/prefijos?passing`);
const lista = await listaRes.json();
if (lista.length === 0) {
  console.error('nadie en passing');
  process.exit(1);
}
const svc = lista[0].Service;
const respuesta = await fetch(`http://${svc.Address}:${svc.Port}/codigo`);
console.log('descubierto', svc.Address, svc.Port, await respuesta.json());
```

```bash
node cliente.mjs
```

**Por qué:** el cliente ya no nombra el 3001. Si el servicio se moviera de puerto, cambiaría el registro, no este fichero.

**Resultado esperado:** `descubierto 127.0.0.1 3001 { codigo: '+34' }`.

## Así se ve

`node cliente.mjs` usa la dirección que devolvió Consul.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Sin passing no hay a quién llamar**
En `server.mjs` cambia el check a `http://prefijos:3001/no-esta`, reconstruye (`docker compose up --build -d`) y espera unos segundos. `node cliente.mjs`.
→ `nadie en passing`. Vuelve a dejar el check en `/salud` para seguir.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El check está critical | `Address` y el check se han cruzado | El check es `http://prefijos:3001/salud`. La Address del cliente es `127.0.0.1` |
| `ECONNREFUSED` en el cliente | El compose no está, o el registro aún no está en passing | `docker compose ps` y la UI |
| El contenedor no coge tu cambio | Editaste `server.mjs` y no reconstruiste | `docker compose up --build -d` |
