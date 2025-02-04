document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o comportamento padrão do formulário

    // Coleta os dados do formulário
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
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

    // Se desejar, você pode concatenar torre e apartamento ou enviá-los separadamente.
    // Aqui vamos concatená-los no formato "Torre-Apartamento" (por exemplo, "1-101")
    const apartment_number = `Torre ${tower} - ${apartment}`;

    // Cria o objeto com os dados do usuário
    const userData = {
        name,
        email,
        password,
        apartment_number,  // campo que contém a informação concatenada
        phone_number
    };

    try {
        // Faça a requisição para o back-end (a rota de cadastro está em /users/register)
        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            // Armazenar o token no localStorage para manter o usuário logado
            localStorage.setItem('token', result.token);  // Ajuste aqui para usar "result.token" em vez de "data.token"

            // Redirecionar o usuário para a página de produtos ou outra página principal
            window.location.href = 'products.html';
        } else {
            document.getElementById('message').innerText = result.error || 'Erro ao cadastrar usuário';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('message').innerText = 'Erro na comunicação com o servidor.';
        document.getElementById('message').style.color = 'red';
    }
});
