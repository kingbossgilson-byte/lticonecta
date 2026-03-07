const API = "https://lticonecta.onrender.com";

async function salvarProfissional() {

    const nome = document.getElementById("inputFirstName").value.trim();
    const sobreNome = document.getElementById("inputLastName").value.trim();
    const nomeCompleto = nome + ' ' + sobreNome;
    const email = document.getElementById("inputEmailRegister").value.trim();
    const password = document.getElementById("inputPasswordRegister").value.trim();
    const confirmarSenha = document.getElementById("inputPasswordRegisterConfirm").value.trim();
    let mensagem = "Erro ao salvar cadastro";

    if (!nome || !sobreNome || !email || !password || !confirmarSenha) {
        mensagem = "Preencha <strong style='color: red;'>todos</strong> os campos.";
        adicionarToastNaTela(mensagem, 'warning', 'exclamation-circle-fill', 'yellow');
        return;
    }

    if (password !== confirmarSenha) {
        mensagem = "As <strong style='color: red;'>senhas</strong> não coincidem!";
        adicionarToastNaTela(mensagem, 'warning', 'exclamation-circle-fill', 'yellow');
        return;
    }

    try {

        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: nomeCompleto,
                email: email,
                password: password,
                accountType: localStorage.getItem("tipoLogin"),
                dataCreate: new Date().toISOString().split("T")[0]

            })
        });

        const data = await response.json();        

        if (response.ok) {

            adicionarToastNaTela(`<strong style='color: white;'>Cadastro realizado com sucesso!</strong>`, 'success', 'check-circle-fill', 'green');

            // Limpa form e modal
            document.getElementById("registerForm").reset();
        } else {
            adicionarToastNaTela(`<strong style='color: white;'>${data.error}</strong>`, 'danger', 'exclamation-triangle-fill', 'darkred');
        }

    } catch (error) {
        console.error(error);
        adicionarToastNaTela(`<strong style='color: white;'>${error}</strong>`, 'danger', 'exclamation-triangle-fill', 'darkred');
    }
}


(() => {
    'use strict'
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('click', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()



function adicionarToastNaTela(mensagem, tipo, icone, cor) {

    const container = document.getElementById("liveToast");

    const toastElement = document.createElement("div");
    toastElement.className = `toast align-items-center text-bg-${tipo} m-2 border-0`;
    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");

    toastElement.innerHTML = `
        <div>
            <div class="d-flex">
                <div class="toast-body p-3">
                <i class="bi bi-${icone} p-2" style="color: ${cor}; font-size: 1rem;"></i>
                 ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>        
    `;

    container.appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

/* const toastTrigger = document.getElementById("liveToastBtn");

toastTrigger.addEventListener("click", adicionarToastNaTela); */
