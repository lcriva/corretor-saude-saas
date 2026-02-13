const pdf = require('pdf-parse');
console.log('Tipo:', typeof pdf);
console.log('Chaves:', Object.keys(pdf));
console.log('É função?', typeof pdf === 'function');
if (typeof pdf !== 'function') {
    console.log('Valor:', pdf);
}
