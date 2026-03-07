// ===============================
// CONTROLE DE PÁGINAS
// ===============================

function mostrarPerfil() {
    const admin = localStorage.getItem("usuarioIsAdministrator") == `1`;

    if (admin) {
        document.getElementById("cadProfissionais").style.display = "block";

    } else {

        document.getElementById("cadProfissionais").style.display = "none";
    }

    document.querySelector(".container.py-3").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "none";
    document.getElementById("relatorioChamadas").style.display = "none";
    document.getElementById("perfilPage").style.display = "block";
}

function mostrarHome() {
    document.getElementById("perfilPage").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "none";
    document.getElementById("relatorioChamadas").style.display = "none";
    document.querySelector(".container.py-3").style.display = "block";
}

function mostrarAtendimento() {
    document.getElementById("perfilPage").style.display = "none";
    document.getElementById("relatorioChamadas").style.display = "none";
    document.querySelector(".container.py-3").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "block";
}

function mostrarRelatorio() {
    document.querySelector(".container.py-3").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "none";
    document.getElementById("perfilPage").style.display = "none";
    document.getElementById("relatorioChamadas").style.display = "block";
}

// ===============================
// LOGOUT
// ===============================

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("recentes");
    window.location.href = "call.html";
}

// ===============================
// BUSCAR PERFIL DO BACKEND
// ===============================

async function carregarPerfil() {

    const userId = localStorage.getItem("usuarioId");

    if (!userId) {
        window.location.href = "call.html";
        return;
    }

    const response = await fetch(`${API}/users/id/${userId}`);
    const user = await response.json();

    document.getElementById("perfilNome").innerText = user.username;
    document.getElementById("perfilEmail").innerText = user.email || "Sem email";
    document.getElementById("perfilDescricao").innerText = user.designation || "Sem descrição";
    document.getElementById("perfilImagem").src = user.profilePic || "./assets/images/default.jpg";

    // Atualiza localStorage também se quiser manter cache
    localStorage.setItem("usuarioNome", user.username);
    localStorage.setItem("usuarioEmail", user.email);
    localStorage.setItem("usuarioIsAdministrator", user.isAdministrator?.data?.[0]);
    localStorage.setItem("usuarioDescricao", user.designation);
    localStorage.setItem("usuarioFoto", user.profilePic);
}

document.addEventListener("DOMContentLoaded", carregarPerfil);

// ===============================
// BOTTOM SHEET
// ===============================

const sheet = document.getElementById("bottomSheet");
const overlay = document.getElementById("overlay");
const sheetTitle = document.getElementById("sheetTitle");
const sheetContent = document.getElementById("sheetContent");


function openSheet(title, contentHTML) {
    sheetTitle.innerText = title;
    sheetContent.innerHTML = contentHTML;

    sheet.classList.add("active");
    overlay.classList.add("active");
}

function closeSheet() {
    sheet.classList.remove("active");
    overlay.classList.remove("active");
}

if (overlay) {
    overlay.addEventListener("click", closeSheet);
}

function mudarSenha() {
    openSheet(
        "Alterar Senha", `
        <span  class="d-flex justify-content-center p-0 mb-0" id="perfilToast"></span>
        <div class="mb-3 p-2">
            <label class="p-2">Senha Atual</label>
            <input type="password" id="senhaAtual" class="form-control">
        </div>

        <div class="mb-3 p-2">
            <label class="p-2">Nova Senha</label>
            <input type="password" id="novaSenha" class="form-control">
        </div>

        <div class="mb-3 p-2">
            <label class="p-2">Confirmar Nova Senha</label>
            <input type="password" id="confirmarSenha" class="form-control">
        </div>

        <button class="btn btn-primary w-100" onclick="salvarNovaSenha()">
            Alterar Senha
        </button>
    `);
}


async function salvarNovaSenha() {
    const userId = localStorage.getItem("usuarioId");
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (!senhaAtual || !novaSenha || !confirmarSenha) {

        toastNaTela("Preencha todos os campos", 'warning', 'exclamation-circle-fill', 'yellow');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        toastNaTela("As senhas digitadas são diferentes", 'warning', 'exclamation-circle-fill', 'yellow');
        return;
    }

    const response = await fetch(`${API}/users/password/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            senhaAtual,
            novaSenha
        })
    });

    const data = await response.json();

    if (response.ok) {
        toastNaTela("Senha alterada com sucesso!", 'success', 'check-circle-fill', 'green');
    } else {
        toastNaTela(data.error || "Erro ao alterar senha", 'danger', 'exclamation-triangle-fill', 'darkred');
    }
}



function editarPerfil() {

    const nome = localStorage.getItem("usuarioNome");
    const email = localStorage.getItem("usuarioEmail");
    const designation = localStorage.getItem("usuarioDescricao");
    const fileInput = localStorage.getItem("usuarioFoto");

    openSheet("Editar Perfil", `
        <span  class="d-flex justify-content-center p-0 mb-0" id="perfilToast"></span>
        <div class="mb-3">
            
            <!-- input escondido -->
            <input 
                id="editFoto" 
                type="file" 
                accept="image/*" 
                style="display: none;"
            >

            <!-- botão com ícone -->
            <label for="editFoto" class="upload-icon">        
                <i><img src="${fileInput}" class="img-thumbnail" alt="Sua foto" width="100" height="100"></i>
                <span class="mb-2"> Escolher foto de Perfil</span>
            </label>

        </div>
        <div class="mb-3">
            <label>Nome</label>
            <input id="editNome" type="text" class="form-control" value="${nome}">
        </div>
        <div class="mb-3">
            <label>Email</label>
            <input id="editEmail" type="email" class="form-control" value="${email}">
        </div>
        <div class="mb-3">
            <label>Descrição</label>
            <input id="editDescricao" type="text" class="form-control" value="${designation}">
        </div>
        <button onclick="salvarPerfil()" class="btn btn-primary w-100">Salvar</button>
    `);
}


function cadastrarProfissional() {


    openSheet("Cadastrar Profissionais", `
        <form id="formProfissional">
        <span  class="d-flex justify-content-center p-0 mb-0" id="perfilToast"></span>
            <div class="mb-3">

            
            <!-- input escondido -->
            <input 
            id="profFoto" 
            type="file" 
            accept="image/*" 
            style="display: none;"
            
            >        
            <!-- botão com ícone -->
            <label for="profFoto" class="upload-icon">        
            <i><img src="./assets/images/animated_robo.png" class="img-thumbnail" alt="Sua foto" width="100" height="100"></i>
            <span class="mb-2"> Escolher foto de Perfil</span>
            </label>
            
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="inputGroup-sizing-default">Nome e Sobrenome</span>
                <input type="text" id="profNome" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" placeholder="Nome e Sobrenome do Profissional">
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="inputGroup-sizing-default">Email</span>
                <input type="text" id="profEmail" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" placeholder="E-mail do Profissional">
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="inputGroup-sizing-default">Whatsapp</span>
                <input type="text" id="profWhatz" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" placeholder="Whatzapp com DDD (51)99999-9999">
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="inputGroup-sizing-default">Atuação</span>
                <input type="text" id="profDescricao" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" placeholder="Interprete de Libras, Consultor...">
            </div>
            <button type="submit" class="btn btn-primary w-100">
                Salvar
            </button>
    `);

    document.getElementById("formProfissional")
        .addEventListener("submit", function (e) {
            e.preventDefault();

            if (this.checkValidity()) {
                salvarProfissional();
            }
        });
}



async function salvarPerfil() {
    try {

        const userId = localStorage.getItem("usuarioId");

        const formData = new FormData();
        formData.append("username", document.getElementById("editNome").value);
        formData.append("email", document.getElementById("editEmail").value);
        formData.append("designation", document.getElementById("editDescricao").value);

        const fileInput = document.getElementById("editFoto");
        if (fileInput.files[0]) {
            formData.append("profilePic", fileInput.files[0]);
        }

        const response = await fetch(`${API}/users/profile/${userId}`, {
            method: "PUT",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            toastNaTela("Perfil atualizado com sucesso!", 'success', 'check-circle-fill', 'green');
            // closeSheet();
            carregarPerfil();
        } else {
            toastNaTela(data.error || "Erro ao alterar perfil", 'danger', 'exclamation-triangle-fill', 'darkred');
        }

    } catch (error) {
        console.error(error);
        toastNaTela("Erro de conexão com servidor", 'danger', 'wifi-off', 'darkred');
    }
}


async function salvarProfissional() {

    const nome = document.getElementById("profNome").value.trim();
    const email = document.getElementById("profEmail").value.trim();
    const whatsapp = document.getElementById("profWhatz").value.trim();
    const descricao = document.getElementById("profDescricao").value.trim();
    const fileInput = document.getElementById("profFoto");

    if (!fileInput.files.length) {
        toastNaTela("A foto é obrigatório.", 'warning', 'exclamation-circle-fill', 'yellow');
        return;
    }

    if (!nome || !email || !whatsapp || !descricao) {
        toastNaTela("Preencha todos os campos", 'warning', 'exclamation-circle-fill', 'yellow');
        return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("username", nome);
    formData.append("email", email);
    formData.append("password", "LTIConecta123");
    formData.append("profilePic", fileInput.files[0]);
    formData.append("cellphone", whatsapp);
    formData.append("designation", descricao);
    formData.append("accountType", "Profissional");

    try {

        const response = await fetch(`${API}/auth/professionalregister`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
                // ❌ NÃO coloque Content-Type aqui
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            toastNaTela("Cadastro realizado com sucesso!", 'success', 'check-circle-fill', 'green');

            // Limpa form e modal
            document.getElementById("formProfissional").reset();
        } else {
            toastNaTela(data.error || "Erro ao salvar cadastro", 'danger', 'exclamation-triangle-fill', 'darkred');
        }

    } catch (error) {
        console.error(error);
        toastNaTela("Erro ao conectar com servidor", 'danger', 'exclamation-triangle-fill', 'darkred');
    }
}



// ===============================
// INICIALIZAÇÃO
// ===============================

/* document.addEventListener("DOMContentLoaded", function () {
    carregarPerfil();
});
 */