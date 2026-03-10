document.addEventListener("DOMContentLoaded", () => {

    // Se existir container da home → carrega lista
    if (document.getElementById("especialistasContainer")) {
        carregarEspecialistas();
    }

    // Se existir elemento da agenda → carrega especialista individual
    if (document.getElementById("agendaUsername")) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        if (id) {
            carregarEspecialista(id);
        }
    }
    renderRecentes(); // sempre tenta renderizar recentes (se tiver)

});


function carregarEspecialistas() {
    fetch("/users")
        .then(response => response.json())
        .then(data => {
            renderEspecialistas(data);
        })
        .catch(error => {
            console.error("Erro ao buscar especialistas:", error);
        });
}

async function carregarEspecialista(id) {
    try {
        const response = await fetch(API + "/users/" + id);
        const user = await response.json();

        if (!response.ok) {
            console.error(user.error);
            return;
        }
        document.getElementById("roomName").innerText = user.sessionName;
        document.getElementById("agendaUsername").innerText = user.username;
        document.getElementById("agendaTelefone").innerText = user.cellphone;
        document.getElementById("agendaDesignation").innerText = user.designation;
        document.getElementById("agendaScore").innerText = "★ " + user.score;
        document.getElementById("agendaProfilePic").src =
            user.profilePic || "./assets/images/default.png";

        // salvar globalmente se precisar depois
        especialistaNome = user.username;
        especialistaImagem = user.profilePic;

    } catch (error) {
        console.error("Erro ao buscar especialista:", error);
    }
}

function renderEspecialistas(users) {
    const summary = localStorage.getItem("usuarioSummary");
    const enterprise = localStorage.getItem("usuarioEnterprise");
    const container = document.getElementById("especialistasContainer");    
    container.innerHTML = "";

    // Função auxiliar para criar o card
    function criarCard(user) {
        const score = parseInt(user.score) || 5;
        const div = document.createElement("div");
        div.className = "card card-custom p-3";
        div.style.minWidth = "350px";

        div.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <img src="${user.profilePic || './assets/images/default.png'}"
                         class="specialist-img me-3">
                    <div>
                        <strong>${user.username}</strong>
                        <span class="text-warning ms-3">${"★".repeat(score) || "★"}</span><br>
                        <small class="text-muted">${user.designation}</small>
                    </div>
                </div>
            </div>
            <div class="mt-3 d-flex justify-content-between">
                <span class="badge text-success">Disponível</span>
                <button class="btn btn-primary btn-sm rounded-pill btn-agendar">
                    Agendar Reunião
                </button>
            </div>
        `;

        container.appendChild(div);

        const botao = div.querySelector(".btn-agendar");
        botao.addEventListener("click", () => {
            abrirModal(user);
            adicionarRecentemente(user); // 🔥 adiciona aos recentes
        });

        return div;
    }

    users.forEach(user => {
        // Condição única para filtrar especialistas
        if ((user.summary == 1 && enterprise == 1) || (user.summary != 1 && enterprise != 1)) {
            criarCard(user);
        }
    });

    iniciarAutoScroll();
}


function abrirModal(user) {
    const score = parseInt(user.score) || 5;
    document.getElementById("roomNameReagendar").style.display = 'none';
    // Preencher dados dentro da modal
    document.getElementById("roomNameTitulo").style.display = 'block';
    document.getElementById("roomName").innerText = user.sessionName;
    document.getElementById("agendaTelefone").innerText = user.cellphone;
    document.getElementById("agendaUsername").innerText = user.username;
    document.getElementById("agendaDesignation").innerText = user.designation;
    document.getElementById("agendaScore").innerText = "★".repeat(score);
    document.getElementById("agendaProfilePic").src =
    user.profilePic || "./assets/images/default.png";
    
    // Criar instância da modal Bootstrap
    const modal = new bootstrap.Modal(
        document.getElementById("staticBackdrop")
    );
    
    document.getElementById("btnAgendar").innerText = "Agendar";
    modal.show();
}


function iniciarAutoScroll() {
    const container = document.getElementById("especialistasContainer");

    if (!container) return; // evita erro

    setInterval(() => {

        container.scrollBy({
            left: 366, // 350 card + 16 gap
            behavior: "smooth"
        });

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
            container.scrollTo({
                left: 0,
                behavior: "smooth"
            });
        }

    }, 5000);
}

function adicionarRecentemente(user) {

    let recentes = JSON.parse(localStorage.getItem("recentes")) || [];

    // remove se já existir (evita duplicado)
    recentes = recentes.filter(u => u.id !== user.id);

    // adiciona no início
    recentes.unshift(user);

    // limita a 5
    if (recentes.length > 3) {
        recentes.pop();
    }

    localStorage.setItem("recentes", JSON.stringify(recentes));

    renderRecentes();
}

function renderRecentes() {

    const container = document.getElementById("recentesContainer");
    if (!container) return;
    container.innerHTML = "";

    const recentes = JSON.parse(localStorage.getItem("recentes")) || [];

    // 🔥 Se não houver nenhum
    if (recentes.length === 0) {
        container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-clock-history fs-4 d-block mb-2"></i>
                    Nenhuma visualização recente
                </div>
        `;
        return;
    }

    // 🔥 Se houver dados
    recentes.forEach(user => {

        const card = document.createElement("div");
        card.className = "card card-custom p-3 text-center";
        card.style.minWidth = "150px";

        card.innerHTML = `
            <img src="${user.profilePic || './assets/images/default.png'}"
                 class="specialist-img mb-2" />
            <strong>${user.username}</strong>
        `;

        card.addEventListener("click", () => {
            abrirModal(user);
        });

        container.appendChild(card);

        setTimeout(() => {
            card.classList.add("show");
        }, 50);
    });
}
