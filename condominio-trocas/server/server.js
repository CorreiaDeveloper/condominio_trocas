const express = require('express');
const cors = require('cors'); // Importa o cors
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

const app = express();

// Habilita o CORS para todas as origens (ou configure conforme necessário)
app.use(cors());

// Middleware para analisar o corpo das requisições em JSON
app.use(express.json());

// Rotas de usuários
app.use('/users', userRoutes);

// Rotas de produtos
app.use('/api/products', productRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
