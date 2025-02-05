document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o comportamento padrão do formulário

    // Coleta os dados do formulário
    const name = document.getElementById('name').value;
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const tower = document.getElementById('tower').value;
    const apartment = document.getElementById('apartment_number').value;
    const phone_number = document.getElementById('phone_number').value || null;

    // Validação: as senhas devem coincidir
    if (password !== confirmPassword) {
        document.getElementById('message').innerText = 'As senhas não coincidem!';
        document.getElementById('message').style.color = 'red';
        return;
    }

    // Cria o objeto com os dados do usuário
    const userData = {
        name,
        login,
        password,
        tower,
        apartment,
        phone_number
    };

    try {
        // Requisição para o back-end (a rota de cadastro está em /users/register)
        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        console.log(result); // Verifique o conteúdo da resposta

        if (response.ok) {
            // Realiza o login automaticamente
            const loginResponse = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: userData.login,
                    password: userData.password
                })
            });

            const loginResult = await loginResponse.json();
            if (loginResponse.ok) {
                // Armazenar o token no localStorage
                localStorage.setItem('token', loginResult.token);

                // Redirecionar o usuário para a página de produtos ou outra página principal
                window.location.href = 'products.html';
            } else {
                document.getElementById('message').innerText = loginResult.error || 'Erro ao realizar login';
                document.getElementById('message').style.color = 'red';
            }
        } else {
            document.getElementById('message').innerText = result.error || 'Erro ao cadastrar usuário';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('message').innerText = 'Erro na comunicação com o servidor.';
        document.getElementById('message').style.color = 'red';
    }
});
