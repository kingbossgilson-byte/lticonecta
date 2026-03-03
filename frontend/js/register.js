const API = "https://lticonecta.onrender.com";

async function salvarProfissional() {

    const nome = document.getElementById("inputFirstName").value.trim();
    const sobreNome = document.getElementById("inputLastName").value.trim();
    const nomeCompleto = nome+' '+sobreNome;
    const email = document.getElementById("inputEmail").value.trim();
    const password = document.getElementById("inputPassword").value.trim();
    const confirmarSenha = document.getElementById("inputPasswordConfirm").value.trim();

    if (!nome || !sobreNome || !email || !password || !confirmarSenha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (password !== confirmarSenha) {
        alert("As senhas não coincidem!");
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
                dataCreate:  new Date().toISOString().split("T")[0]
                
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
            alert(data.error || "Erro ao salvar cadastro");
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com servidor");
    }
}