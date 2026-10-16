// El hash no se descifra: compare solo dice si la candidata cuadra.
// El 10 es el coste. Subirlo hace el cálculo más lento a propósito.
import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('clave-de-eva', 10);
console.log(hash);
console.log('coincide', await bcrypt.compare('clave-de-eva', hash));
console.log('otra', await bcrypt.compare('otra', hash));
