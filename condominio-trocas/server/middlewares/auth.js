const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Verificando se o cabeçalho Authorization está presente
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Token não fornecido!' });
    }

    // Remover o "Bearer " do token
    const bearerToken = token.split(' ')[1];

    // Verificando e validando o token JWT
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido!' });
        }

        // Adicionar as informações do usuário decodificadas no req.user
        req.user = decoded;
        next();  // Passa o controle para a próxima função (rota)
    });
};

module.exports = authenticate;
