// Função para fazer login
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Cria o objeto com os dados do usuário
    const userData = {
        email,
        password,
    };

    try {
        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('message').innerText = 'Login realizado com sucesso!';
            document.getElementById('message').style.color = 'green';
            // Armazenar o token em localStorage ou sessionStorage
            localStorage.setItem('token', result.token);
            // Redirecionar para a página principal ou para a área do usuário
            window.location.href = 'home.html';  // Exemplo de redirecionamento
        } else {
            document.getElementById('message').innerText = result.error || 'Erro ao fazer login';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('message').innerText = 'Erro na comunicação com o servidor.';
        document.getElementById('message').style.color = 'red';
    }
});
