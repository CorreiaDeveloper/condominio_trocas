require('dotenv').config();  // Carrega variáveis do .env
const mysql = require('mysql2');

// Verificando se as variáveis de ambiente estão carregadas corretamente
console.log(process.env.DB_USER);  // Exibe o valor da variável DB_USER
console.log(process.env.DB_PASS);  // Exibe o valor da variável DB_PASS

// Criação da conexão com o MySQL
const pool = mysql.createPool({
    user: process.env.DB_USER,        // Correção: usar "user" em vez de "username"
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
});

// Exportando a pool de conexões para uso em outras partes do código
module.exports = pool.promise();
