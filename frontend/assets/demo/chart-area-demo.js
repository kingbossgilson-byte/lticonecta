document.addEventListener("DOMContentLoaded", function () {
    fetchData();
});

let dados = [];
function fetchData() {
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
                dados = data.data;
                gerarGrafico(dados); // chama a função para criar o gráfico
            }
        })
        .catch(error => console.error("Erro na requisição:", error));
}

// Função para gerar o gráfico
function gerarGrafico(dados) {
    // Meses
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Inicializa array de dados com 0 para cada mês
    let dadosPorMes = new Array(12).fill(0);

    // Percorre os dados e soma o percentual por mês
    dados.forEach(item => {
        if(item['Data cadastro'] && item['Percentual'] !== undefined) {
            let data = new Date(item['Data cadastro']);
            let mes = data.getMonth(); // 0 = Janeiro, 11 = Dezembro
            dadosPorMes[mes] = parseFloat(item['Percentual']); // soma se houver mais de um registro no mesmo mês
        }
    });

    // Cria o gráfico
    var ctx = document.getElementById("myAreaChart");
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: "Porcentual Mês",
                lineTension: 0.3,
                backgroundColor: "rgba(2,117,216,0.2)",
                borderColor: "rgba(2,117,216,1)",
                pointRadius: 5,
                pointBackgroundColor: "rgba(2,117,216,1)",
                pointBorderColor: "rgba(255,255,255,0.8)",
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(2,117,216,1)",
                pointHitRadius: 50,
                pointBorderWidth: 2,
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
                    ticks: { min: 0 },
                    gridLines: { color: "rgba(0, 0, 0, .125)" }
                }],
            },
            legend: { display: true }
        }
    });
}
