# MongoDB y Mongoose

[← Página anterior](00-donde-vive-el-dato.md) · [Siguiente página →](02-lab-postgres-sequelize.md)

Vas a guardar `NX-1` en MongoDB y a leerlo con otro proceso, después de haber cerrado el que lo escribió.

### Objetivo

Ver el documento `{ sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 }` impreso por un segundo `node`, con el primero ya terminado.

### Punto de partida

```bash
mkdir -p ~/nexo/m04-mongo && cd ~/nexo/m04-mongo
npm init -y
npm pkg set type=module
npm install mongoose
docker rm -f nexo-mongo >/dev/null 2>&1 || true
docker run -d --name nexo-mongo -p 27017:27017 mongo:7
until docker exec nexo-mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'; do sleep 2; done
```

- La URL de conexión es `mongodb://127.0.0.1:27017/nexo`.
- El `until` termina cuando `mongosh` imprime `1`.

### En qué consiste

Defines el modelo, haces un upsert del SKU, cierras ese proceso y lees desde otro fichero.

### 1 — Escribe el alta

**Acción:** guarda `alta.mjs`.

```js
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/nexo');

const Producto = mongoose.model('Producto', new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  nombre: String,
  stock: Number,
}));

const doc = await Producto.findOneAndUpdate(
  { sku: 'NX-1' },
  { sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 },
  { upsert: true, new: true },
);
console.log(doc.toJSON());
await mongoose.disconnect();
```

**Por qué:** `catalogo` es dueño de este documento. `upsert` deja el lab repetible: la segunda ejecución no choca con el índice único.

**Resultado esperado:** `alta.mjs` creado.

### 2 — Graba el producto

**Acción:**

```bash
node alta.mjs
```

**Por qué:** hasta que este proceso termina, el dato podría estar solo en memoria. Al desconectar, lo que queda está en MongoDB.

**Resultado esperado:** un JSON con `sku` `NX-1`, `nombre` `Sobre 1 kg`, `stock` 40 y un `_id`. El programa vuelve al prompt.

### 3 — Escribe la lectura

**Acción:** guarda `lectura.mjs`.

```js
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/nexo');

const Producto = mongoose.model('Producto', new mongoose.Schema({
  sku: String,
  nombre: String,
  stock: Number,
}));

const doc = await Producto.findOne({ sku: 'NX-1' }).lean();
console.log(doc);
await mongoose.disconnect();
```

**Por qué:** es otro proceso, el que atendería un GET. No tiene el array del alta: pregunta a la base.

**Resultado esperado:** `lectura.mjs` creado.

### 4 — Lee después del alta

**Acción:**

```bash
node lectura.mjs
```

**Por qué:** si el documento aparece, el catálogo ya no depende de que el proceso que hizo el POST siga vivo.

**Resultado esperado:** un objeto con `sku` `NX-1` y `stock` 40.

## Comprueba tu entendimiento

**Sigue ahí con el contenedor en marcha**
Ejecuta otra vez `node lectura.mjs`.
→ El mismo `sku` y el mismo `stock`. No has vuelto a hacer el alta.

## Reto

### 1 — Baja el stock a 35

Actualiza el documento y léelo.

<details>
<summary>Ver solución</summary>

Añade en `alta.mjs`, o en un fichero nuevo con el mismo modelo, antes de desconectar:

```js
await Producto.updateOne({ sku: 'NX-1' }, { stock: 35 });
```

`node alta.mjs` y después `node lectura.mjs`. `stock` es 35.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ECONNREFUSED 27017` | El `until` no llegó a imprimir 1, o el contenedor se paró | `docker ps` y, si falta, repite el `docker run` del punto de partida |
| `E11000 duplicate key` | Un `create` en vez del `findOneAndUpdate` | Usa el upsert del paso 1 |
| `lectura` imprime `null` | Otra base distinta de `nexo`, o el alta no llegó | La URL de los dos ficheros acaba en `/nexo` |
