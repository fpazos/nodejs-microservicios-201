import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('clave-de-eva', 10);
console.log(hash);
console.log('coincide', await bcrypt.compare('clave-de-eva', hash));
console.log('otra', await bcrypt.compare('otra', hash));
