const express = require('express');
const pool = require('../config/db');  // Conexão com o banco
const router = express.Router();
const jwt = require('jsonwebtoken');  // Importar o jwt para verificar o token

// Middleware para validar o token JWT e extrair o ID do usuário
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Pegando o token do header Authorization

    if (!token) {
        return res.status(403).json({ error: 'Token não fornecido!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido!' });
        }
        req.user = user;  // Guardar o usuário no objeto da requisição
        next();  // Passar para a próxima função middleware ou rota
    });
};

// Listar produtos de todos os usuários, excluindo os do usuário autenticado
router.get('/', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;  // Pegando o ID do usuário autenticado do token

    try {
        // Modificando a consulta para retornar todos os produtos, exceto os do usuário autenticado
        const [rows] = await pool.query('SELECT * FROM products WHERE user_id != ?', [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum produto encontrado!' });
        }
        
        res.json(rows);  // Retorna a lista de produtos encontrados
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar produtos.');
    }
});

// Criar novo produto
router.post('/', authenticateJWT, async (req, res) => {
    const { title, description, price, is_donation, category, dimensions, specifications, photos } = req.body;
    const userId = req.user.userId; // Obtendo o ID do usuário autenticado do token

    // Verificando se os dados obrigatórios foram fornecidos
    if (!title || !price) {
        return res.status(400).json({ error: 'Título e preço são obrigatórios!' });
    }

    try {
        // Inserir produto na tabela 'products'
        const query = `
            INSERT INTO products (user_id, title, description, price, is_donation, category, dimensions, specifications)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            userId,
            title,
            description,
            price,
            is_donation,
            category,
            dimensions,
            specifications
        ]);

        const productId = result.insertId; // Obtendo o ID do produto recém-criado

        // Se o campo 'photos' foi fornecido, associar as imagens ao produto na tabela 'product_images'
        if (photos && Array.isArray(photos)) {
            const photoQueries = photos.map(photo => {
                return pool.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [productId, photo]);
            });

            // Esperar que todas as imagens sejam inseridas
            await Promise.all(photoQueries);
        }

        res.status(201).json({ id: productId, message: 'Produto criado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao criar produto.');
    }
});

// Deletar produto
router.delete('/:id', authenticateJWT, async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.userId;

    try {
        // Verificar se o produto existe e se pertence ao usuário
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado ou você não tem permissão para excluir este produto.' });
        }

        // Deletar o produto
        await pool.query('DELETE FROM products WHERE id = ?', [productId]);

        res.status(200).json({ message: 'Produto excluído com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir produto.');
    }
});

// Alterar produto
router.put('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params; // ID do produto a ser atualizado
    const { title, description, price, is_donation, category, dimensions, specifications, photos } = req.body;
    const userId = req.user.userId; // Obtendo o ID do usuário autenticado do token

    // Verificando se o usuário que está tentando atualizar o produto é o dono
    try {
        const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (productRows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado!' });
        }

        const product = productRows[0];
        if (product.user_id !== userId) {
            return res.status(403).json({ error: 'Você não tem permissão para atualizar este produto!' });
        }

        // Atualizando as informações do produto
        const query = `
            UPDATE products
            SET title = ?, description = ?, price = ?, is_donation = ?, category = ?, dimensions = ?, specifications = ?
            WHERE id = ?
        `;
        await pool.query(query, [title, description, price, is_donation, category, dimensions, specifications, id]);

        // Se houver fotos, atualizar a tabela product_images
        if (photos) {
            // Primeiro, deletar imagens existentes para o produto
            await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);

            // Inserir as novas imagens
            const photoQueries = photos.map(photo => {
                return pool.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [id, photo]);
            });
            await Promise.all(photoQueries);
        }

        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar o produto.');
    }
});


module.exports = router;
