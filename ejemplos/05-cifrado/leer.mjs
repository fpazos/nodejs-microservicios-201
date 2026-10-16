import { createDecipheriv } from 'node:crypto';
import { readFileSync } from 'node:fs';

const clave = readFileSync('clave.bin');
const datos = readFileSync('direccion.bin');
const desc = createDecipheriv('aes-256-gcm', clave, datos.subarray(0, 12));
desc.setAuthTag(datos.subarray(12, 28));
console.log(Buffer.concat([desc.update(datos.subarray(28)), desc.final()]).toString('utf8'));
