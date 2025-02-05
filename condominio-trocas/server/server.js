const express = require('express');
const cors = require('cors'); 
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const path = require('path'); // Importação do módulo path

const app = express();

// Configurar o diretório estático para arquivos públicos
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/api/products', productRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
