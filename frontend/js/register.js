const API = "https://lticonecta.onrender.com";

async function salvarProfissional() {

    const nome = document.getElementById("inputFirstName").value.trim();
    const sobreNome = document.getElementById("inputLastName").value.trim();
    const nomeCompleto = nome + ' ' + sobreNome;
    const email = document.getElementById("inputEmail").value.trim();
    const password = document.getElementById("inputPassword").value.trim();
    const confirmarSenha = document.getElementById("inputPasswordConfirm").value.trim();
    let mensagem = "Erro ao salvar cadastro";

    if (!nome || !sobreNome || !email || !password || !confirmarSenha) {
        mensagem = "Preencha todos os campos.";
        adicionarToastNaTela(mensagem);
        return;
    }

    if (password !== confirmarSenha) {
        mensagem = "As senhas não coincidem!";
        adicionarToastNaTela(mensagem);
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
                accountType: "Cliente",
                dataCreate: new Date().toISOString().split("T")[0]

            })
        });

        const data = await response.json();        

        if (response.ok) {
            const alertDiv = document.createElement("div");
            alertDiv.className = "alert alert-success mt-2";
            alertDiv.role = "alert";
            alertDiv.innerText = "Cadastro realizado com sucesso!";
            document.getElementById("registerForm").parentElement.appendChild(alertDiv);

            // Limpa form e modal
            document.getElementById("registerForm").reset();
        } else {
            adicionarToastNaTela(data.error);
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com servidor");
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



function adicionarToastNaTela(mensagem) {

    const container = document.getElementById("liveToast");

    const toastElement = document.createElement("div");
    toastElement.className = "toast align-items-center text-bg-warning m-2 border-0";
    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");

    toastElement.innerHTML = `
        <div>
            <div class="d-flex">
                <div class="toast-body">
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
