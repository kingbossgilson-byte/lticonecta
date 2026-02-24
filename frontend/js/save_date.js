function showModal(contentHTML) {
    const container = document.createElement('div');
    container.classList.add('modal', 'fade');
    container.tabIndex = -1;
    container.innerHTML = `${contentHTML}`;

    // Adicionar o container da modal ao body
    document.body.appendChild(container);

    // Inicializar e mostrar a modal
    const modal = new bootstrap.Modal(container);
    modal.show();

    // Opcional: Remover a modal do DOM após o fechamento
    container.addEventListener('hidden.bs.modal', function () {
        container.remove();
    });
}
function formatarData(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
}

function coletarValoresDinamicos() {
    const dinamicos = {};

    document.querySelectorAll(".percent-input-dynamic").forEach(input => {
        const coluna = input.dataset.coluna;
        const valor = input.value || 0;
        dinamicos[coluna] = Number(valor);
    });

    return dinamicos;
}

window.dados_grupo = function () {
    if (dadosCarregadosHierarquia.length === 0) {        
        const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                            <div class="modal-body">
                                <div class="alert alert-warning" role="alert">
                                Favor carregar um arquivo primeiro!
                            </div>
                            </div>
                            <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
             </div>
        `;
        showModal(content);
        return;
    }
        // 🔹 COLETAR VALORES DAS COLUNAS DINÂMICAS DO HTML
    const colunasDinamicas = coletarValoresDinamicos();

    // 🔹 INSERIR AS COLUNAS DINÂMICAS EM CADA ITEM DO JSON
    window.dadosCarregadosHierarquia.forEach(item => {
        Object.keys(colunasDinamicas).forEach(col => {
            item[col] = colunasDinamicas[col];   // <-- SALVA JUNTO NO JSON
        });
    });
    fetch('./backend/config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'grupos_contabeis', data: window.dadosCarregadosHierarquia })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.text();  // Alterar para 'text' para inspecionar a resposta bruta
        })
        .then(responseText => {
            console.log("Resposta em texto bruto:", responseText);
            try {
                const data = JSON.parse(responseText);
                const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Salvando...</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Seus dados foram salvos com sucesso</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
                showModal(content);
                setTimeout(function () {
                    document.getElementById("btnBaixar").removeAttribute("disabled");
                }, 1000);
            } catch (e) {
                console.error("Erro ao parsear o JSON:", e);
                const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-danger" role="alert">
                                Resposta inesperada do servidor: ${e.message}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
                showModal(content);
            }
        })
        .catch(error => {
            console.error('Erro ao enviar os dados:', error);
            const content = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger" role="alert">
                            Erro ao salvar os dados.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;
            showModal(content);
        });
}

const columnAliases = {
    Conta: "Conta",
    presidente: "Presidente",
    plenario: "Plenário",
    conselheiros: "Conselheiros",
    "Data cadastro": "Data Cadastro",
    Saldo: "Saldo para Base de Calculo",
    gabinete_executivo: "Gabinete Executivo",
    super_executiva: "Superintendência Executiva",
    asse_executiva: "Assessoria Executiva",
    secretaria: "Secretaria" ,
    juridico: "Jurídico" ,
    informatica: "Informática" ,
    rh: "Recursos" ,
    engenharia: "Engenharia" ,
    licitacoes_contratos: "Licitações/Contratos" ,
    eventos: "Eventos" ,
    cidead: "CIDEAD" ,
    erpa: "ERPA" ,
    fia: "FIA" ,
    eprocad: "EPROCAD" ,
    apoio_patrocinio: "Apoios/Patrocínios" ,
    enbra: "ENBRA" ,
    coordenacao_fiscal_registro: "Coordenação/Fiscalização/Registro" ,
    fiscalizacao: "Fiscalização" ,
    atendimento: "Atendimento" ,
    registro: "Registro" ,
    cancelamento: "Cancelamento" ,
    serv_relacio_admin: "Serviço Relacionamento ao Administrador" ,
    coord_financeira: "Coordenação Financeira" ,
    contabilidade: "Contabilidade Financeiro" ,
    cobranca: "Cobrança" ,
    comunicacao: "Comunicação" ,
    asses_marketing: "Assessoria de Marketing" ,
    seccinal_pelotas: "Seccional Pelotas" ,
    seccional_passo_fundo: "Seccional Passo Fundo" ,
    seccional_santa_maria: "Seccional Santa Maria" ,
    seccional_ijui: "Seccional Ijuí" ,
    seccional_novo_hamburgo: "Seccional Novo Hamburgo" ,
    seccional_caxias: "Seccional Caxias do Sul" ,
    camara_saude: "Câmara Saúde" ,
    camara_mediacao_arbitragem: "Câmara Mediação/Arbitragem" ,
    camara_ensino: "Câmara Ensino" ,
    camara_respon_social_sustentabilidade: "Câmara Responsabilidade Social/Sustentabilidade" ,
    camara_jovem: "Câmara Jovem" ,
    camara_relacoes_int: "Câmara Relações Internacionais" ,
    camara_tec_inov: "Câmara Tecnologia/Inovação" ,
    camara_agronegocio: "Câmara Agronegócio" ,
    camara_complaice_governanca: "Câmara Complaice/Governança" ,
    camara_empreender_micro_pequena_empresa: "Câmera Empreendedorismo/Micro/Pequenas Empresas" ,
    camara_mulher: "Câmara Mulher" ,
    camara_rh: "Câmara Gestão Recursos Humanos" ,
    camara_gestao_publica: "Câmara Gestão Pública" ,
    comissao_eleitoral: "Comissão Eleitoral" ,
    comissao_etica_disciplinar: "Comissão Ética/Desciplina" ,
    comissao_decoro: "Comissão Decoro" ,
    multiplicadores: "Multiplicadores" ,
    representantes_regionais: "Representantes Regionais" ,
};

const colunasRemover = [
    "Id",
    "filhos",
    "hash", 
    "parent_id", 
    "data_exclusao", 
    "usuario_exclusao",
    "Percentual",
    "Saldo Anterior",
    "Débitos",
    "Créditos",
    "data_criacao",
    "data_alteracao",
    "usuario_exclusao",
    "data_exclusao",
];

function flattenData(data) {
    let result = [];

    data.forEach(item => {
        let linha = {};

        // LIMPA CONTA
        linha["Conta"] = (item.Conta || "")
            .replace(/(&nbsp;|\u00A0)+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // PROCESSA CAMPOS NORMAIS
        for (const key in item) {
            if (key === "filhos") continue;
            if (/_percent$/i.test(key)) continue;
            if (/_desconto$/i.test(key)) continue;

            let alias = columnAliases[key] || key;
            linha[alias] = item[key];
        }
        
        // TRATAR *_desconto → manda para alias correto
        Object.keys(item).forEach(key => {
            if (/_desconto$/i.test(key)) {
                let base = key.replace("_desconto", "");
                if (columnAliases[base]) {
                    const alias = columnAliases[base];
                    linha[alias] = item[key];
                    console.log(linha[alias]);
                }
            }
        });

        result.push(linha);

        if (item.filhos && Array.isArray(item.filhos)) {
            result = result.concat(flattenData(item.filhos));
        }
    });

    return result;
}

window.exportarParaExcel = function () {

    // -----------------------------------
    // 1. FILTRAR POR DESCONTO (antes de tudo)
    // -----------------------------------
    function filtrarComDesconto(data) {
        return data
            .map(item => {
                const temDesconto =
                    Object.entries(item).some(([k, v]) =>
                        k.endsWith("_desconto") &&
                        v !== null &&
                        v !== "" &&
                        Number(v) !== 0
                    );

                if (temDesconto) {
                    return { ...item, filhos: item.filhos ?? [] };
                }
                return null;
            })
            .filter(x => x !== null);
    }

    const dadosFiltrados = filtrarComDesconto(dadosCarregadosHierarquia);

    // -----------------------------------
    // 2. FLATTEN + limpeza Conta + números
    // -----------------------------------
    const dados = flattenData(dadosFiltrados).map(item => {
        const novo = {};

        Object.entries(item).forEach(([key, value]) => {

            // limpar &nbsp;
            if (key === "Conta" && typeof value === "string") {
                value = value.replace(/(&nbsp;|\u00A0)+/g, " ").trim();
            }

            // número válido → converter
            if (
                typeof value === "string" &&
                value.match(/^\d+(\.\d+)?$/)
            ) {
                value = Number(value);
            }

            novo[key] = value;
        });

        return novo;
    });

    // -----------------------------------
    // 3. REMOVER COLUNAS INDESEJADAS
    // -----------------------------------
    function limparColunas(item) {
        const novo = {};
        Object.entries(item).forEach(([key, value]) => {
            if (!colunasRemover.includes(key)) {
                novo[key] = value;
            }
        });
        return novo;
    }

    const dadosLimpos = dados.map(limparColunas);

    // -----------------------------------
    // 4. GERAR COLUNAS DINÂMICAS
    // -----------------------------------
    function getDynamicColumns(dados) {
        const colunas = new Set();
        dados.forEach(item => {
            Object.entries(item).forEach(([k, v]) => {
                if (v !== null && v !== "" && v !== undefined)
                    colunas.add(k);
            });
        });
        return [...colunas];
    }

    const colunas = getDynamicColumns(dadosLimpos);

    // remover colunas proibidas
    const colunasFiltradas = colunas.filter(c =>
        !colunasRemover.includes(c) &&
        !colunasRemover.includes(columnAliases[c])
    );

    if (!colunasFiltradas.length) {
        alert("Nenhuma coluna válida encontrada para exportar.");
        return;
    }

    // -----------------------------------
    // 5. GERAR EXCEL
    // -----------------------------------
    XlsxPopulate.fromBlankAsync().then(workbook => {

        const sheet = workbook.sheet(0);
        sheet.name("Relatório");

        // CABEÇALHOS
        const headerLabels = colunasFiltradas.map(col => columnAliases[col] || col);
        sheet.cell("A1").value([headerLabels]);

        sheet.row(1).style({
            bold: true,
            fill: "4472C4",
            fontColor: "FFFFFF",
            horizontalAlignment: "center"
        });

        // DADOS
        const linhas = dadosLimpos.map(item =>
            colunasFiltradas.map(col => {
                const v = item[col];

                // converter data
                if (col.toLowerCase().includes("data") && v) {
                    return new Date(v);
                }

                // manter número
                if (typeof v === "number") return v;

                return v ?? "";
            })
        );

        sheet.cell("A2").value(linhas);

        const lastRow = linhas.length + 1;
        const lastCol = colunasFiltradas.length;
        const lastColLetter = String.fromCharCode(64 + lastCol);

        // FORMATAR TUDO
        sheet.range(`A1:${lastColLetter}${lastRow}`).style({
            border: true,
            verticalAlignment: "center",
            horizontalAlignment: "left"
        });

        sheet.range(`A1:${lastColLetter}${lastRow}`).autoFilter();

        // FORMATAR DATAS
        colunasFiltradas.forEach((col, idx) => {
            if (col.toLowerCase().includes("data")) {
                const letter = String.fromCharCode(65 + idx);
                sheet.range(`${letter}2:${letter}${lastRow}`)
                    .style("numberFormat", "dd/mm/yyyy hh:mm:ss");
            }
        });

colunasFiltradas.forEach((col, idx) => {

    const letter = String.fromCharCode(65 + idx);

    let colunaEhNumerica = true;

    // Verifica TODAS as células da coluna
    for (let row = 2; row <= lastRow; row++) {
        const cell = sheet.cell(`${letter}${row}`);
        const raw = cell.value();

        if (raw === null || raw === "" || raw === undefined) continue;

        // se for string, tentar converter
        let num = raw;

        if (typeof raw === "string") {
            num = Number(raw.replace(/\./g, "").replace(",", "."));
        }

        if (isNaN(num)) {
            colunaEhNumerica = false;
            break;
        }
    }

    // Se NÃO for numérica → não formatar
    if (!colunaEhNumerica) return;

    // Agora formatar toda a coluna como MOEDA BRL
    for (let row = 2; row <= lastRow; row++) {
        const cell = sheet.cell(`${letter}${row}`);
        let val = cell.value();

        if (val === null || val === "" || val === undefined) continue;

        // converter strings numéricas
        if (typeof val === "string") {
            val = Number(val.replace(/\./g, "").replace(",", "."));
        }

        if (!isNaN(val)) {
            cell.value(Number(val));
            cell.style("numberFormat", '"R$" #,##0.00');
        }
    }

});

        // LARGURA AUTOMÁTICA
        colunasFiltradas.forEach((col, i) => {
            const letter = String.fromCharCode(65 + i);
            sheet.column(letter).width(Math.max(15, col.length + 5));
        });

        return workbook.outputAsync("blob");

    }).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "Relatorio.xlsx";
        a.click();
    })
    .catch(err => console.error("Erro ao gerar Excel:", err));
};


