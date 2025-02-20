document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    const userData = { login, password };

    try {
        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok && result.token) {
            document.getElementById('message').innerText = 'Login realizado com sucesso!';
            document.getElementById('message').style.color = 'green';

            // Salvar o token no localStorage
            localStorage.setItem('token', result.token);

            // Redirecionar para a página de produtos
            window.location.href = 'products.html'; 
        } else {
            document.getElementById('message').innerText = result.error || 'Erro ao fazer login';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('message').innerText = 'Erro na comunicação com o servidor.';
        document.getElementById('message').style.color = 'red';
    }
});
