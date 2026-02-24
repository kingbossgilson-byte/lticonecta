import { formatCurrency } from './format_values';

let dados = [];
let reportType = '';
document.addEventListener("DOMContentLoaded", function () {
    initializeDataTable('#datatablesSimple');

    let startDate = document.getElementById('startDate');
    let endDate = document.getElementById('endDate');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const dropdownButton = document.getElementById('dropdownMenuButton');

/*     const savedReportType = localStorage.getItem('tipoRelatorio');
    if (savedReportType) {
        dropdownButton.textContent =
            savedReportType === 'grupos_contabeis'
                ? 'Relatório com Percentual'
                : 'Relatório Original';
    } */

    dropdownItems.forEach(item => {
        item.addEventListener('click', event => {
            event.preventDefault(); // evita reload
            reportType = item.getAttribute('data-value');

            // muda o texto do botão
            dropdownButton.textContent = item.textContent.trim();
            startDate.value = '';
            // salva o valor no localStorage (ou sessionStorage se preferir)
            // localStorage.setItem('tipoRelatorio', reportType);
        });
    });
    // Se o campo endDate estiver vazio, define a data de hoje
    if (endDate && !endDate.value) {
        endDate.value = new Date().toISOString().split('T')[0];
    }

    // Adiciona os listeners
    if (startDate) startDate.addEventListener('change', fetchData);
    if (endDate) endDate.addEventListener('change', fetchData);

    // Chama fetchData ao carregar a página
    fetchData();
});
function formatarData(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
}
function fetchData() {
    let startDateVal = document.getElementById('startDate').value;
    let endDateVal = document.getElementById('endDate').value;

    if (!startDateVal || !endDateVal) return;

    // Adiciona hora 00:00:00 no início e 23:59:59 no final
    let startDateTime = `${startDateVal} 00:00:00`;
    let endDateTime = `${endDateVal} 23:59:59`;

    let apiUrl = `http://localhost/relatorios/backend/getDate.php?table=${reportType}&startDate=${startDateTime}&endDate=${endDateTime}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar os dados.");
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("Erro:", data.error);
            } else if (data.message) {
                console.log("Mensagem:", data.message);
            } else {
                dados = data.data;
                displayTable(data.data, '#tableContainer3', '#datatablesSimple', reportType);
            }
        })
        .catch(error => console.error("Erro na requisição:", error));
}
function getDynamicColumns(dados) {
    if (!dados || dados.length === 0) return [];

    const colunasValidas = new Set();

    dados.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                colunasValidas.add(key);
            }
        });
    });

    return Array.from(colunasValidas);
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

function createTable(containerSelector, tableSelector, columns) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Erro: contêiner da tabela (${containerSelector}) não encontrado!`);
        return;
    }

const colCount = columns.length;
const perCol = 150; // px estimados por coluna (ajuste se quiser)
const minWidth = colCount * perCol;

container.innerHTML = `
    <div class="card-body" style="max-height: auto; overflow-y: auto; padding: 0.5rem;">
        <div style="overflow-x: auto; width: 100%;">
            <table id="${tableSelector.slice(1)}"
                   class="table table-striped"
                   style="width:100%; min-width: ${minWidth}px; white-space: nowrap; border-collapse: separate;">
                <thead>
                    <tr>${columns.map(col => `<th>${columnAliases[col] || col}</th>`).join('')}</tr>
                </thead>
                <tfoot>
                    <tr>${columns.map(col => `<th>${columnAliases[col] || col}</th>`).join('')}</tr>
                </tfoot>
                <tbody></tbody>
            </table>
        </div>
    </div>
`;
}

/* function populateTable(tableSelector, dados, columns, formatValues = false) {
    const tbody = document.querySelector(`${tableSelector} tbody`);
    if (!tbody) return;

    dados.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = columns.map(col => {
            const value = row[col] || '';
            return `<td>${formatValues && col === 'Conta' || col === 'Percentual' ? value : col === 'Data cadastro' ? formatarData(value) : formatCurrency(value)}</td>`;
        }).join('');
        tbody.appendChild(tr);
    });

    initializeDataTable(tableSelector);
} */
function populateTable(tableSelector, dados, columns, formatValues = false) {
    const tbody = document.querySelector(`${tableSelector} tbody`);
    if (!tbody) return;

    dados.forEach(row => {
        const tr = document.createElement('tr');

        tr.innerHTML = columns.map(col => {
            let value = row[col];

            if (col === "Data cadastro") {
                value = formatarData(value);
            } else if (!isNaN(value) && value !== "" && value !== null) {
                value = formatCurrency(value);
            }

            return `<td>${value ?? ""}</td>`;
        }).join('');

        tbody.appendChild(tr);
    });

    initializeDataTable(tableSelector);
}


/* function displayTable(dados, containerSelector, tableSelector, reportType) {
    console.debug("Vamos ver se vem outros campos", dados);
    const columns = reportType === 'info_contabeis' ? ['Conta', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo', 'Data cadastro'] : ['Conta', 'Saldo Anterior', 'Débitos', 'Créditos', 'Saldo', 'presidente', 'Data cadastro'];
        createTable(containerSelector, tableSelector, columns);
        populateTable(tableSelector, dados, columns, true);
    } */
       // Remover colunas internas que você não quer mostrar
const colunasRemover = [
    "hash", 
    "parent_id", 
    "data_exclusao", 
    "usuario_exclusao",
    "id",
    "Saldo Anterior",
    "Débitos",
    "Créditos",
    "data_criacao",
    "data_alteracao",
    "usuario_exclusao",
    "data_exclusao",
];
function displayTable(dados, containerSelector, tableSelector) {

    const columns = getDynamicColumns(dados);
    const columnsFiltradas = columns.filter(c => !colunasRemover.includes(c));

    console.log("Colunas detectadas dinamicamente:", columnsFiltradas);

    createTable(containerSelector, tableSelector, columnsFiltradas);
    populateTable(tableSelector, dados, columnsFiltradas, true);
}

window.exportarParaExcelRelatorios = function () {

    let colunas = getDynamicColumns(dados);

    // 🔥 Filtrar colunas indesejadas
    const colunasFiltradas = colunas.filter(col =>
        !colunasRemover.includes(col) &&
        !colunasRemover.includes(columnAliases[col])
    );

    XlsxPopulate.fromBlankAsync().then(workbook => {
        const sheet = workbook.sheet(0);
        sheet.name("Relatório");

        // Cabeçalho
        const aliasesCabecalho = colunasFiltradas.map(col => columnAliases[col] || col);
        sheet.cell("A1").value([aliasesCabecalho]);

        // Estilo do cabeçalho
        sheet.row(1).style({
            bold: true,
            fill: "4472C4",
            fontColor: "FFFFFF",
            horizontalAlignment: "center"
        });

        // Corpo (linhas de dados)
        const linhas = dados.map(item =>
            colunasFiltradas.map(col => {

                let value = item[col];

                // 🔵 Tratamento de datas
                if (col.toLowerCase().includes("data") && value) {
                    return new Date(value);
                }

                // 🔵 Tratamento de números
                if (!isNaN(value) && value !== null && value !== "" && value !== undefined) {
                    return Number(value);
                }

                return value;
            })
        );

        sheet.cell("A2").value(linhas);

        const lastRow = linhas.length + 1;
        const lastCol = colunasFiltradas.length;

        // Bordas + alinhamento
        sheet.range(`A1:${String.fromCharCode(64 + lastCol)}${lastRow}`).style({
            border: true,
            verticalAlignment: "center",
            horizontalAlignment: "left"
        });

        // AutoFiltro
        sheet.range(`A1:${String.fromCharCode(64 + lastCol)}${lastRow}`).autoFilter();

        // Ajuste de largura automático
        aliasesCabecalho.forEach((alias, i) => {
            const colLetter = String.fromCharCode(65 + i);
            sheet.column(colLetter).width(alias.length < 20 ? 20 : alias.length + 5);
        });

        // --------------------------------------------------------------------
        // 🔥 APLICA FORMATAÇÃO POR TIPO DE COLUNA
        // --------------------------------------------------------------------

        const ignorarFormatacaoNumero = ["Conta", "Data Cadastro"];

        colunasFiltradas.forEach((col, index) => {

            const alias = columnAliases[col] || col;
            const colLetter = String.fromCharCode(65 + index);

            for (let row = 2; row <= lastRow; row++) {

                const cell = sheet.cell(`${colLetter}${row}`);
                const value = cell.value();

                // ======================
                // 📌 FORMATAÇÃO DE DATA
                // ======================
                if (value instanceof Date) {
                    if (alias === "Data Cadastro") {
                        // Data com hora
                        cell.style("numberFormat", "dd/mm/yyyy hh:mm:ss");
                    } else {
                        // Data simples
                        cell.style("numberFormat", "dd/mm/yyyy");
                    }
                    continue;
                }

                // ======================
                // 📌 FORMATAÇÃO DE NÚMERO (BRL)
                // ======================
                if (!isNaN(value) && value !== "" && value !== null && value !== undefined) {

                    // Ignorar colunas específicas
                    if (ignorarFormatacaoNumero.includes(alias)) continue;

                    // Converter e aplicar formatação BR
                    cell.value(Number(value));
                    cell.style("numberFormat", '"R$" #.##0,00');
                }

            }
        });

        // --------------------------------------------------------------------

        return workbook.outputAsync("blob");
    })
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "Relatorio.xlsx";
            a.click();
        })
        .catch(error => {
            console.error("Erro ao gerar Excel:", error);
        });
};





/* window.exportarParaExcelRelatorios = function () {
    XlsxPopulate.fromBlankAsync().then(workbook => {
        const sheet = workbook.sheet(0);
        sheet.name("Relatório");

        // Cabeçalhos
        const headers = [
            "Código", "Conta", "Saldo Anterior", "Débitos", "Créditos",
            "Saldo", "Presidência", "Data cadastro"
        ];

        sheet.cell("A1").value([headers]);
        sheet.row(1).style({
            bold: true,
            fill: "4472C4",
            fontColor: "FFFFFF",
            horizontalAlignment: "center"
        });

        // 🔹 Aqui você usa os dados reais da variável `dados`
        // Se `dados` vem do fetch, basta mapear:
        const linhas = dados.map((d, index) => ([
            index + 1,
            d.Conta,
            d["Saldo Anterior"],
            d["Débitos"],
            d["Créditos"],
            d.Saldo,
            d.presidente,
            new Date(d["Data cadastro"])
        ]));
        
        sheet.cell("A2").value(linhas);

        // 🔹 Tudo que usa "linhas" precisa estar dentro deste bloco
        const lastRow = linhas.length + 1;

        // Estilo geral
        sheet.range(`A1:I${lastRow}`).style({
            border: true,
            verticalAlignment: "center",
            horizontalAlignment: "left"
        });

        // Formatação
        for (let row = 2; row <= lastRow; row++) {
            // converte C:F para número
            ['C', 'D', 'E', 'F', 'G'].forEach(col => {
                const cell = sheet.cell(`${col}${row}`);
                cell.value(Number(cell.value())); // garante que é number
                cell.style("numberFormat", 'R$ #,##0.00');
            });

            // G como percentual (0.35 = 35%)
            // const cellG = sheet.cell(`G${row}`);
            // cellG.value(Number(cellG.value()) / 100);
            // cellG.style("numberFormat", '0.0%');
        }
        sheet.range(`H2:H${lastRow}`).style("numberFormat", "dd/mm/yyyy hh:mm:ss");
        // Linhas zebradas
        for (let i = 2; i <= lastRow; i++) {
            if (i % 2 === 0) {
                sheet.row(i).style("fill", "F2F2F2");
            }
        }

        // Filtros e larguras
        sheet.range(`A1:I${lastRow}`).autoFilter();
        ["A", "C", "D", "E", "F", "G"].forEach(col => sheet.column(col).width(15));
        ["B"].forEach(col => sheet.column(col).width(50));
        ["H"].forEach(col => sheet.column(col).width(20));

        // Baixar arquivo
        return workbook.outputAsync("blob");
    })
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "Relatorio.xlsx";
            a.click();
        })
        .catch(error => {
            console.error("Erro ao gerar Excel:", error);
        });
}; */
