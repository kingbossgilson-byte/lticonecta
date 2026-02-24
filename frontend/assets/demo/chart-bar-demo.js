document.addEventListener("DOMContentLoaded", function () {
    fetchDataBar();
});

let dadosBar = [];
function fetchDataBar() {
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
                dadosBar = data.data;
                gerarGraficoBar(dadosBar);
            }
        })
        .catch(error => console.error("Erro na requisição:", error));
}

// Função para gerar o gráfico
function gerarGraficoBar(dadosBar) {
    // Meses
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Inicializa array de dados com 0 para cada mês
    let dadosPorMes = new Array(12).fill(0);

    // Percorre os dados e soma o percentual por mês
    dadosBar.forEach(item => {
        if(item['Data cadastro'] && item['Percentual'] !== undefined) {
            let data = new Date(item['Data cadastro']);
            let mes = data.getMonth();
            dadosPorMes[mes] = parseFloat(item['Percentual']); // soma se houver mais de um registro no mesmo mês
        }
    });

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Bar Chart Example
    var ctx = document.getElementById("myBarChart");
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: "Percentual Mês",
                backgroundColor: "rgba(2,117,216,1)",
                borderColor: "rgba(2,117,216,1)",
                data: dadosPorMes,
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: { display: false },
                    ticks: { maxTicksLimit: 12 }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: Math.max(...dadosPorMes) * 1.5,
                        maxTicksLimit: 10
                    },
                    gridLines: { display: true }
                }],
            },
            legend: { display: true }
        }
    });
}