// ===============================
// CONTROLE DE PÁGINAS
// ===============================

function mostrarRelatorio() {
    document.querySelector(".container.py-3").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "none";
    document.getElementById("perfilPage").style.display = "none";
    document.getElementById("relatorioChamadas").style.display = "block";
}
function mostrarHome() {
    document.getElementById("perfilPage").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "none";
    document.querySelector(".container.py-3").style.display = "block";
    document.getElementById("relatorioChamadas").style.display = "none";
}

function mostrarAtendimento() {
    document.getElementById("perfilPage").style.display = "none";
    document.getElementById("atendimentoPage").style.display = "block";
    document.querySelector(".container.py-3").style.display = "none";
    document.getElementById("relatorioChamadas").style.display = "none";
}


/* // Adicionar sessão na tela do cliente
function adicionarRelatorioTela() {

    const container = document.getElementById("sessionsListRelatorio");

    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";

    card.innerHTML = `
        <div class="card-body">
            <div class="row align-items-center">

                <!-- 🔹 FOTO -->
                <div class="col-3 text-center">
                    <img src="http://localhost/lticonecta/frontend/${sessao.image}" 
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
                </div>

            </div>
        </div>
    `;

    container.prepend(card);
} */


// ================================
// CARREGAR SESSÕES DO PROFISSIONAL
// ================================

async function carregarRelatorio() {

    const token = localStorage.getItem("token");

    try {
            const response = await fetch(API + "/agenda", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const sessoes = await response.json();

            if (!response.ok) {
                console.error("Erro backend:", sessoes);
                return [];
            }

            return sessoes;

    } catch (error) {
        console.error("Erro ao carregar sessões:", error);
        return [];
    }
}

function calcularDuracaoMinutos(start, end) {
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);

    const inicio = h1 * 60 + m1;
    const fim = h2 * 60 + m2;

    return (fim - inicio) * 60;
}


function renderizarSessoes(lista, status) {

    const container = document.getElementById("sessionsListRelatorio");
    container.innerHTML = "";

    lista.forEach(sessao => {

        let datasParaRenderizar = [];

        // 🔹 AGENDADA
        if (status === "Agendada") {

            datasParaRenderizar.push({
                data: sessao.date,
                hora: sessao.startTime,
                modelo: sessao.callType,
                duracao: null
            });

        } else if(status === "Cancelada"){

                datasParaRenderizar.push({
                data: sessao.date,
                hora: sessao.startTime,
                modelo: sessao.callType,
                duracao: null
            });
        }
        // 🔹 COMPLETADA
        else {
            const agrupadoPorData = {};
            const dataInicio = !sessao.startDate ? sessao.date : new Date(sessao.startDate).toISOString().split("T")[0];

                if (sessao.checkInTime && sessao.endTime) {
                    const duracao = calcularDuracaoMinutos(sessao.checkInTime, sessao.endTime);

                    if (!agrupadoPorData[sessao.date]) {
                        agrupadoPorData[sessao.date] = 0;
                    }

                    agrupadoPorData[sessao.date] += duracao;
                } else {

               
                if (sessao.date) {
                    
                    const duracao = calcularDuracaoMinutos(sessao.startTime, sessao.endTime);

                    if (!agrupadoPorData[sessao.date]) {
                        agrupadoPorData[sessao.date] = 0;
                    }

                    agrupadoPorData[sessao.date] += duracao || 0;
                }
              
            }

            datasParaRenderizar = Object.entries(agrupadoPorData).map(
                ([data, duracao]) => ({
                    data: dataInicio,
                    hora: sessao.checkInTime || sessao.startTime,
                    modelo: sessao.callType,
                    duracao: duracao
                })
            );
        }

        const admin = localStorage.getItem("usuarioIsAdministrator") == 1;
        const tipoUsuario = localStorage.getItem("usuarioTipo");

        // 🔥 RENDERIZAÇÃO ÚNICA
        datasParaRenderizar.forEach(item => {

            const card = document.createElement("div");
            card.className = "card session-card p-2 mb-1 shadow-sm";

            card.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div class="d-flex align-items-center">
                        <img src="${sessao.image || './assets/images/default.jpg'}"
                        class="specialist-img me-2">
                        <div>
                            <h6 class="m-2">${sessao.name}</h6>
                            <small class="m-2">${sessao.designation}</small>
                        </div>
                          
                    </div>
                    
                    <div class="text-end">
                        <span class="text-primary">
                            ${formatarData(item.data)}
                            ${item.hora ? `às ${item.hora}` : ""}
                        </span><br>

                        ${
                            item.duracao !== null
                                ? `<small class="text-primary">
                                    Entrada: ${sessao.checkInTime || sessao.endTime} - Saída: ${sessao.endTime} Duração: ${formatDuration(item.duracao)}
                                   </small><br>`
                                : ""
                        }
                        <span class="status-badge text-bg-warning mt-2 d-inline-block">
                            ${item.modelo}
                        </span>
                        ${item.modelo === 'Presencial' && !sessao.endTime && status === 'Agendada' && (tipoUsuario == 'Profissional' || admin)
                            ? renderCheckButton(sessao)
                            : ""
                        }
                        <span class="status-badge mt-2 d-inline-block">
                            ${status}
                        </span>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    });
}

async function fazerCheck(id, tipo) {

    const token = localStorage.getItem("token");
    const agora = new Date();
    const horaAtual = agora.toTimeString().slice(0,5);

    const body = {};

    if (tipo === "checkin") {
        body.checkInTime = horaAtual;
        body.startDate = agora;
    }

    if (tipo === "checkout") {
        body.endTime = horaAtual;
        body.isCompleted = 1;
    }

    await fetch(`${API}/agenda/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(body)
    });

    carregarAgendadas(); // recarrega estado real do banco
}


function formatDuration(seconds) {
  seconds = Number(seconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}


const tabAgendada = document.getElementById("tabAgendada");
const tabCompletadas = document.getElementById("tabCompletadas");
const tabCanceladas = document.getElementById("tabCanceladas");

tabAgendada.addEventListener("click", () => {
  ativarTab("agendada");
});

tabCompletadas.addEventListener("click", () => {
  ativarTab("completadas");
});

tabCanceladas.addEventListener("click", () => {
  ativarTab("canceladas");
});

function ativarTab(tipo) {

  // Remove active dos dois
  tabAgendada.classList.remove("active");
  tabCompletadas.classList.remove("active");
  tabCanceladas.classList.remove("active");

  if (tipo === "agendada") {
    tabAgendada.classList.add("active");

    carregarAgendadas(); // chama sua função
  } else if(tipo === "completadas") {
    tabCompletadas.classList.add("active");

    carregarCompletadas(); // chama sua função
  } else {
    tabCanceladas.classList.add("active");

    carregarCanceladas(); // chama sua função
  }
}


function renderCheckButton(sessao) {

    // Se já fez check-out → não mostra botão
    if (sessao.endTime) {
        return "";
    }

    // Se já fez check-in mas não check-out → mostrar Check-Out
    if (sessao.checkInTime && !sessao.endTime) {
        return `
            <button 
                class="status-badge text-bg-danger mt-2 d-inline-block border-0"
                onclick="fazerCheck(${sessao.id}, 'checkout')">
                Check-Out
            </button><br>
        `;
    }

    // Caso contrário → Check-In
    return `
        <button 
            class="status-badge text-bg-success mt-2 d-inline-block border-0"
            onclick="fazerCheck(${sessao.id}, 'checkin')">
            Check-In
        </button><br>
    `;
}



async function carregarAgendadas() {
    const sessoes = await carregarRelatorio();
    const now = new Date();
    const hoje = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const agora = `${hours}:${minutes}`;

    const agendadas = sessoes.filter(sessao => {

        if (sessao.isCompleted?.data?.[0] !== 0) return false;

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

        const agenda =  dataHoraSessao >= now;
        return agenda;
    });

    renderizarSessoes(agendadas, "Agendada");
}



async function carregarCompletadas() {
    const sessoes = await carregarRelatorio();
    const now = new Date();
    const hoje = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const agora = `${hours}:${minutes}`;

    const finalizadas = sessoes.filter(sessao => {
         if (sessao.isCompleted?.data?.[0] !== 1) return false;

        const diaHoras = (sessao.date <= hoje || sessao.date >= hoje) && (sessao.endTime || sessao.startTime);

        return diaHoras;
});

    renderizarSessoes(finalizadas, "Completada");
}

async function carregarCanceladas() {
    const sessoes = await carregarRelatorio();
    const now = new Date();
    const hoje = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const agora = `${hours}:${minutes}`;

    const canceladas = sessoes.filter(sessao => {
         if (sessao.isCanceled?.data?.[0] !== 1) return false;

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

        const cancelados =  dataHoraSessao <= now && sessao.endTime == null;
        return cancelados;
});
    
    renderizarSessoes(canceladas, "Cancelada");
}

// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    carregarAgendadas(); // começa mostrando agendadas
});