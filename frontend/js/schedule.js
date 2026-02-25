
const API = "";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
        carregarEspecialista(id);
    }

    carregarSessoes();
});

let callFrame = null;
let roomAtual = null;

const homeContainer = document.querySelector(".container.py-3");
const atendimentoPage = document.getElementById("atendimentoPage");
const btnAtendimento = document.getElementById("btnAtendimento");
const btnAgendar = document.getElementById("btnAgendar");
const perfilPage = document.getElementById("perfilPage");
const relatorioChamadas = document.getElementById("relatorioChamadas");

async function carregarEspecialista(id) {
    try {
        const response = await fetch(API + "/users/id/" + id);
        const user = await response.json();

        if (!response.ok) {
            console.error(user.error);
            return;
        }
        document.getElementById("roomName").innerText = user.sessionName;
        document.getElementById("agendaUsername").innerText = user.username;
        document.getElementById("agendaDesignation").innerText = user.designation;
        document.getElementById("agendaScore").innerText = "★ " + user.score;
        document.getElementById("agendaProfilePic").src =
            user.profilePic || "./assets/images/default.jpg";

        // salvar globalmente se precisar depois
        especialistaNome = user.username;
        especialistaImagem = user.profilePic;

    } catch (error) {
        console.error("Erro ao buscar especialista:", error);
    }
}
function abrirAtendimento() {
    homeContainer.style.display = "none";
    perfilPage.style.display = "none";
    relatorioChamadas.style.display = "none";
    atendimentoPage.style.display = "block";
    iniciarDaily();
}

// Mostrar a pagina Reunião e Abrir a Daily
if (btnAtendimento) {
    btnAtendimento.addEventListener("click", function (e) {
        e.preventDefault();
        abrirAtendimento();
    });
}

function iniciarDaily() {
    if (callFrame) return;

    if (!roomAtual) {
        document.getElementById("logoOverlay").style.display = "block";
    } else {
        document.getElementById("logoOverlay").remove();
    }
    callFrame = DailyIframe.createFrame(
        document.getElementById("videoContainer"),
        {
            showLeaveButton: true,
            iframeStyle: {
                width: "100%",
                height: "100%",
                border: "0",
            },
        },
    );

    // 🔹 Quando alguém sair
    callFrame.on("participant-left", async (event) => {
        console.log("Saiu:", event.participant.user_name);

        const participantes = callFrame.participants();

        // Conta participantes ativos
        const ativos = Object.values(participantes)
            .filter(p => p.session_id && !p.local)
            .length;

        console.log("Participantes ativos:", ativos);

        // Se não tiver mais ninguém além do local
        if (ativos === 0) {
            console.log("Última pessoa saiu. Finalizando sessão...");

            await fetch(API + "/agenda/finalizar-sessao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomName: roomAtual.split("/").pop()
                })
            });
        }
    });

    // 🔹 Quando EU sair
    callFrame.on("left-meeting", async () => {
        console.log("Especialista saiu da reunião.");

        await fetch(API + "/agenda/finalizar-sessao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                roomName: roomAtual.split("/").pop()
            })
        });

        callFrame.destroy();
        callFrame = null;
    });

    callFrame.join({
        // url: roomAtual || "https://vlibras.daily.co/salanica2_1770950888039",
        url: roomAtual,
    });
}


function voltarHome() {
    atendimentoPage.style.display = "none";
    homeContainer.style.display = "block";

    if (callFrame) {
        callFrame.leave();
        callFrame.destroy();
        callFrame = null;
    }
}


// Abrir a modal de agendamento
if (btnAgendar) {
    btnAgendar.addEventListener("click", async (e) => {
        e.preventDefault();
        salvarAgendamento();
    });
}


async function salvarAgendamento({ id = null, isCanceled = 0, startTime = null, dateAgenda = null } = {}) {

    const token = localStorage.getItem("token");

    const idReagendamento = document.getElementById("idReagendamento").innerText;
    const finalId = idReagendamento || id || null;

    const name = document.getElementById("agendaUsername").innerText;
    const cellphone = document.getElementById("agendaTelefone").innerText;
    const designation = document.getElementById("agendaDesignation").innerText;
    const img = document.getElementById("agendaProfilePic");
    const especialistaImagem = img.getAttribute("src");
    const sessionName = document.getElementById("roomName").value ||
        document.getElementById("roomNameReagendar").innerText;
    const date = document.getElementById("date").value || dateAgenda;
    const time = document.getElementById("time").value;
    const radioSelecionado = document.querySelector('input[name="inlineRadioOptions"]:checked');

    const tipoAtendimento = radioSelecionado ? radioSelecionado.value : '';

    const payload = {
        idCliente: localStorage.getItem("usuarioId"),
        clientName: localStorage.getItem("usuarioNome"),
        image: especialistaImagem,
        name,
        cellphone,
        designation,
        sessionName,
        date,
        callType: tipoAtendimento,
        startTime: time || startTime,
        isCompleted: false,
        isCanceled: isCanceled
    };

    try {
        const response = finalId
            ? await fetch(`${API}/agenda/${finalId}`, { method: "PUT", headers, body: JSON.stringify(payload) })
            : await fetch(`${API}/agenda`, { method: "POST", headers, body: JSON.stringify(payload) });

        let data = {};
        try { data = await response.json(); } catch (e) { /* ignorar se não for JSON */ }

        if (response.ok) {
            if (isCanceled == 1) {
            } else {
                const alertDiv = document.createElement("div");
                alertDiv.className = "alert alert-success mt-2";
                alertDiv.role = "alert";
                alertDiv.innerText = finalId ? "Agendamento atualizado com sucesso!" : "Agendamento realizado com sucesso!";
                document.getElementById("scheduleForm").parentElement.appendChild(alertDiv);

                document.getElementById("btnFechar").style.display = 'none';
                document.getElementById("linkFechar").style.display = 'block';

                // Limpa form e modal
                document.getElementById("scheduleForm").reset();
                document.getElementById("idReagendamento").innerText = "";
            }
        } else {
            alert(data.error || "Erro ao salvar agendamento");
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com servidor");
    }
}

function validarFormularioAgendamento() {

    const erros = [];

    const tipoAtendimento = document.querySelector('input[name="inlineRadioOptions"]:checked');
    const titulo = document.getElementById("roomName").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!tipoAtendimento) erros.push("Selecione o tipo de atendimento.");
    if (!titulo) erros.push("Informe o título da agenda.");
    if (!date) erros.push("Selecione uma data.");
    if (!time) erros.push("Selecione um horário.");

    if (erros.length > 0) {
        alert(erros.join("\n"));
        return false;
    }

    return true;
}

// Adicionar sessão na tela do cliente
function adicionarSessaoNaTela(sessao) {
    const container = document.getElementById("sessionsList");

    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";

    card.innerHTML = `
        <div class="card-body">
            <div class="row align-items-center">

                <!-- 🔹 FOTO -->
                <div class="col-3 text-center">
                    <img src="http://localhost/apiFlutter/frontend/${sessao.image}" 
                         class="img-fluid rounded-circle"
                         style="width:80px;height:80px;object-fit:cover;">
                    <p class="mt-2 fw-bold">${sessao.name}</p>
                </div>

                <!-- 🔹 INFORMAÇÕES -->
                <div class="col-9">
                    <h5 class="card-title">${sessao.sessionName}</h5>
                    <p class="card-text">
                        <strong>Data:</strong> ${formatarData(sessao.date)} <br>
                        <strong>Horário:</strong> ${sessao.startTime} <br>
                    </p>

                    <a href="${sessao.roomUrl}" 
                       target="_blank" 
                       class="btn btn-success btn-sm">
                        Entrar
                    </a>
                </div>

            </div>
        </div>
    `;

    container.prepend(card);
}

// ===============================
// CARREGAR SESSÕES DO CLIENTE
// ===============================
async function carregarSessoes() {

    const token = localStorage.getItem("token");
    const idCliente = localStorage.getItem("usuarioId");
    const userName = localStorage.getItem("usuarioNome");
    document.getElementById("nomeBemVindo").innerText = userName;

    try {

        const response = await fetch(API + "/agenda/" + idCliente, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const sessoes = await response.json();

        if (!response.ok) {
            console.error("Erro backend:", sessoes);
            return;
        }
        const container = document.getElementById("sessionsListHome");
        const now = new Date();
        const hoje = now.toISOString().split('T')[0];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const agora = `${hours}:${minutes}`;

        document.getElementById("sessionsListHome").innerHTML = "";

        sessoes.forEach((sessao, i) => {

            const [ano, mes, dia] = sessao.date.split("-");
            const [hora, minuto] = sessao.startTime.split(":");

            const dataHoraSessao = new Date(
                Number(ano),
                Number(mes) - 1,
                Number(dia),
                Number(hora),
                Number(minuto),
                0
            );

            const agenda = dataHoraSessao >= now;
            const canceladas = dataHoraSessao <= now && sessao.endTime == null && sessao.isCompleted?.data?.[0] == 0;

            if (canceladas) {
                salvarAgendamento({ id: sessao.id, isCanceled: 1, startTime: sessao.startTime, dateAgenda: sessao.date });
            }

            if (agenda) {
                const card = document.createElement("div");
                card.className = "card card-custom p-3";
                card.style.minWidth = "250px";

                card.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${sessao.image || './assets/images/default.jpg'}"
                            class="specialist-img me-2">
                        <div>
                            <strong>${sessao.name}</strong><br>
                            <small>${formatarData(sessao.date)} às ${sessao.startTime}</small>
                        </div>
                    </div>

                    <div class="mt-3 d-flex justify-content-between">
                        <button class="btn btn-light btn-sm rounded-pill btn-agendar">
                            Reagendar
                        </button>
                        ${sessao.callType === 'Presencial'
                        ? `<small 
                                    class="status-badge text-bg-warning mt-0 ">
                                    Presencial
                                </small>`

                        : `<button 
                                    class="btn btn-primary btn-sm rounded-pill btn-chamar">
                                    Chamar
                                </button>`
                    }  
                    </div>
                    ${sessao.callType === 'Remoto'
                        ? `
                            <div class="mt-2 d-flex justify-content-between">
                                <button class="btn btn-outline-secondary btn-sm rounded-pill btn-copiar"
                                    data-id="${sessao.id}">
                                    Copiar Link
                                </button>

                                <button class="btn btn-outline-dark btn-sm rounded-pill btn-qrcode"
                                    data-id="${sessao.id}">
                                    QR Code
                                </button>
                            </div> `
                        : ''
                    }
                `;
                container.appendChild(card);

                const botao = card.querySelector(".btn-agendar");
                const botaoChamar = card.querySelector(".btn-chamar");
                const botaoCopiar = card.querySelector(".btn-copiar");
                const botaoQRCode = card.querySelector(".btn-qrcode");

                if (botao) {
                    botao.addEventListener("click", () => {
                        abrirModalReagendar(sessao);
                    });
                }

                if (botaoChamar) {
                    botaoChamar.addEventListener("click", () => {
                        roomAtual = sessao.roomUrl;
                        abrirAtendimento();
                    });
                }
                if (botaoCopiar) {
                    botaoCopiar.addEventListener("click", () => {
                        roomAtual = sessao.roomUrl;
                        copiarLink(roomAtual);
                    });
                }
                if (botaoQRCode) {
                    botaoQRCode.addEventListener("click", () => {
                        roomAtual = sessao.roomUrl;
                        qrCodeLink(roomAtual);
                    });
                }
            }
        });

    } catch (error) {
        console.error("Erro ao carregar sessões:", error);
    }
}

async function copiarLink(link) {
    try {
        await navigator.clipboard.writeText(link);
        alert("Link copiado com sucesso!");
    } catch (err) {
        console.warn("Clipboard API bloqueada, usando fallback...");

        // fallback antigo
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);

        alert("Link copiado com sucesso!");
    }
}

async function qrCodeLink(roomAtual) {
    const modal = document.getElementById("qrModalBody");
    modal.innerHTML = "";

    new QRCode(modal, {
        text: roomAtual,
        width: 300,
        height: 300
    });

    abrirModalQR();
}

function abrirModalQR() {
    const modal = new bootstrap.Modal(
        document.getElementById("qrModal")
    );
    modal.show();
}

function abrirModalReagendar(user) {

    const score = parseInt(user.score) || 5;

    document.getElementById("roomNameTitulo").style.display = 'none';
    document.getElementById("roomNameReagendar").style.display = 'block';

    document.getElementById("btnAgendar").innerText = "Reagendar";
    document.getElementById("idReagendamento").innerText = user.id;

    // ✅ Marca o radio correto
    const radio = document.querySelector(
        `input[name="inlineRadioOptions"][value="${user.callType}"]`
    );
    if (radio) radio.checked = true;

    document.getElementById("date").value = user.date;
    document.getElementById("time").value = user.startTime;
    document.getElementById("roomNameReagendar").innerText = user.sessionName;
    document.getElementById("agendaUsername").innerText = user.name || user.username;
    document.getElementById("agendaDesignation").innerText = user.designation;
    document.getElementById("agendaScore").innerText = "★".repeat(score);
    document.getElementById("agendaProfilePic").src =
        user.image || user.profilePic;

    const modal = new bootstrap.Modal(
        document.getElementById("staticBackdrop")
    );

    modal.show();
}


// ===============================
// CALENDÁRIO
// ===============================
flatpickr("#calendarInline", {
    inline: true, // 🔥 deixa sempre visível
    locale: "pt",
    minDate: "today",
    dateFormat: "Y-m-d",
    defaultDate: "today",

    onChange: function (selectedDates, dateStr) {
        document.getElementById("date").value = dateStr;
    },
});

function calcularHorarioFinal(start, duration) {
    const [hour, minute] = start.split(":");
    const date = new Date();
    date.setHours(parseInt(hour));
    date.setMinutes(parseInt(minute) + parseInt(duration));
    return date.toTimeString().slice(0, 5);
}

function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}
