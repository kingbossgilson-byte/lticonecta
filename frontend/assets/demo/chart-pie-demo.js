document.addEventListener("DOMContentLoaded", function () {
    fetchDataPie();
});

let dadosPie = [];

function fetchDataPie() {
    let apiUrl = `http://localhost/relatorios/backend/getPercent.php?table=grupos_contabeis`;

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
                dadosPie = data.data;
                gerarGraficoPie(dadosPie);
            }
        })
        .catch(error => console.error("Erro na requisição:", error));
}

// ----------------------
// Função para gerar o gráfico
// ----------------------
function gerarGraficoPie(dadosPie) {
    // Estrutura: { [ano]: [Set de percentuais únicos por mês] }
    const valoresPorAno = {};

    dadosPie.forEach(item => {
        const rawData = item["Data cadastro"];
        let percentualRaw = item["Percentual"];
        if (!rawData || percentualRaw == null) return;

        // Trata vírgulas e símbolos
        let percentual = String(percentualRaw)
            .replace("%", "")
            .replace(",", ".")
            .trim();
        percentual = parseFloat(percentual);
        if (isNaN(percentual)) return;

        // Extrai mês e ano
        const data = new Date(rawData);
        if (isNaN(data)) return;
        const mes = data.getMonth(); // 0..11
        const ano = data.getFullYear();

        // Inicializa estrutura
        if (!valoresPorAno[ano]) {
            valoresPorAno[ano] = Array.from({ length: 12 }, () => new Set());
        }

        // Adiciona valor único ao conjunto daquele mês
        valoresPorAno[ano][mes].add(percentual.toFixed(2));
    });

    // Soma total por ano (somando apenas percentuais únicos por mês)
    const somaPorAno = {};
    Object.keys(valoresPorAno).forEach(ano => {
        let somaAno = 0;
        valoresPorAno[ano].forEach(set => {
            set.forEach(v => somaAno += parseFloat(v));
        });
        somaPorAno[ano] = Number(somaAno.toFixed(2));
    });

    // Dados prontos para o gráfico
    const labels = Object.keys(somaPorAno);
    const valores = Object.values(somaPorAno);

    // Cores automáticas (até 10 anos)
    const cores = [
        "#007bff", "#dc3545", "#ffc107", "#28a745",
        "#17a2b8", "#6610f2", "#fd7e14", "#6f42c1",
        "#20c997", "#e83e8c"
    ];

    // Configuração Chart.js
    Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#292b2c';

    const ctx = document.getElementById("myPieChart");
    if (!ctx) {
        console.error("Canvas myPieChart não encontrado!");
        return;
    }

    // Destroi gráfico anterior se existir
    if (window.myPieChartInstance) {
        window.myPieChartInstance.destroy();
    }

    window.myPieChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Soma dos Percentuais Únicos (Jan–Dez)",
                data: valores,
                backgroundColor: cores.slice(0, labels.length),
            }],
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        color: "#333",
                        font: { size: 14 },
                        generateLabels: chart => {
                            const data = chart.data;
                            return data.labels.map((label, i) => ({
                                text: `${label} (${data.datasets[0].data[i]})`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                            }));
                        }
                    }
                }
            }
        }
    });
}
