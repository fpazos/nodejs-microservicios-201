// GCM sí se revierte, con la misma clave. El IV es nuevo en cada cifrado
// y viaja delante del fichero: sin él, la clave sola no recupera el texto.
// La etiqueta va en medio para detectar bytes alterados.
import { createCipheriv, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const clave = randomBytes(32);
const iv = randomBytes(12);
const cifrador = createCipheriv('aes-256-gcm', clave, iv);
const cifrado = Buffer.concat([cifrador.update('Calle Mayor 1', 'utf8'), cifrador.final()]);
const tag = cifrador.getAuthTag();
writeFileSync('direccion.bin', Buffer.concat([iv, tag, cifrado]));
writeFileSync('clave.bin', clave);
console.log('guardado', cifrado.length, 'bytes');
