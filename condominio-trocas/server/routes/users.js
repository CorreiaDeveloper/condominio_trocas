const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');  // Conexão com o banco
const authenticate = require('../middlewares/auth');  // Importando o middleware de autenticação
const router = express.Router();

// Rota para login
router.post('/login', async (req, res) => {
    const { login, password } = req.body;  // Alterado para login

    // Verificando se os dados obrigatórios foram fornecidos
    if (!login || !password) {  // Alterado para login
        return res.status(400).json({ error: 'Login e senha são obrigatórios!' });
    }

    // Verificando se o usuário existe no banco de dados
    const [rows] = await pool.query('SELECT * FROM users WHERE login = ?', [login]);  // Alterado para login

    if (rows.length === 0) {
        return res.status(400).json({ error: 'Login ou senha inválidos!' });
    }

    // Comparando a senha informada com a senha armazenada (hash)
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
        return res.status(400).json({ error: 'Login ou senha inválidos!' });
    }

    // Gerando o token JWT
    const token = jwt.sign({ userId: user.id, login: user.login }, process.env.JWT_SECRET, { // Alterado para login
        expiresIn: '1h', // O token vai expirar em 1 hora
    });

    // Retornando o token JWT
    res.status(200).json({ message: 'Login bem-sucedido', token });
});

// Rota de Cadastro
router.post('/register', async (req, res) => {
    const { name, login, password, tower, apartment } = req.body;  // Alterado para login
    console.log(req.body);

    // Validar campos obrigatórios
    if (!name || !login || !password || !tower || !apartment) {  // Alterado para login
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    // Verificar se o login já existe
    const [existingUser] = await pool.query('SELECT * FROM users WHERE login = ?', [login]);  // Alterado para login
    if (existingUser.length > 0) { 
        return res.status(400).json({ error: 'Login já cadastrado!' });  // Alterado para login
    }

    // Gerar o hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        // Inserir o usuário no banco de dados
        const query = `
            INSERT INTO users (name, login, password_hash, apartment_number, phone_number)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            name,
            login,  // Alterado para login
            passwordHash,
            `Torre ${tower} - ${apartment}`, // Formatar o campo apartamento
            req.body.phone_number // Supondo que o telefone também venha do corpo da requisição
        ]);

        // Gerar o token JWT
        const userId = result.insertId;
        const token = jwt.sign({ userId, login }, process.env.JWT_SECRET, { expiresIn: '1h' });  // Alterado para login

        // Enviar o token de volta para o cliente
        res.status(201).json({ message: 'Cadastro realizado com sucesso!', token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao criar o usuário.');
    }
});

// Alterar dados do usuário
router.put('/me', authenticate, async (req, res) => {
    const userId = req.user.userId; // ID do usuário que está fazendo a requisição
    const { name, login, phone_number } = req.body;  // Alterado para login

    // Verificando se ao menos um campo foi informado para alteração
    if (!name && !login && !phone_number) {  // Alterado para login
        return res.status(400).json({ error: 'Informe ao menos um campo para atualização!' });
    }

    try {
        let query = 'UPDATE users SET ';
        let params = [];
        
        // Adicionando os campos alterados na query
        if (name) {
            query += 'name = ?, ';
            params.push(name);
        }
        if (login) {  // Alterado para login
            query += 'login = ?, ';  // Alterado para login
            params.push(login);
        }
        if (phone_number) {
            query += 'phone_number = ?, ';
            params.push(phone_number);
        }

        // Removendo a vírgula final e ajustando a query
        query = query.slice(0, -2);
        query += ' WHERE id = ?';
        params.push(userId);

        // Executando a query
        await pool.query(query, params);

        res.status(200).json({ message: 'Usuário alterado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar dados do usuário.');
    }
});

// Excluir conta de usuário
router.delete('/me', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Remover todos os produtos associados ao usuário
        await pool.query('DELETE FROM products WHERE user_id = ?', [userId]);

        // Excluir o usuário
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        res.status(200).json({ message: 'Usuário e todos os seus produtos foram excluídos com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir conta.');
    }
});

// Rota protegida: Retorna as informações do usuário logado
router.get('/me', authenticate, async (req, res) => {
    const userId = req.user.userId;  // Informações do usuário decodificadas no token

    // Buscando os dados do usuário no banco de dados
    const [rows] = await pool.query('SELECT id, name, login, apartment_number, phone_number FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado!' });
    }

    const user = rows[0];
    res.status(200).json({ user });
});

module.exports = router;
