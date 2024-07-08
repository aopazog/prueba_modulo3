document.getElementById('convert').addEventListener('click', convertCurrency);

let chart; // Variable global para almacenar la instancia del gráfico

async function fetchData() {
    try {
        const response = await fetch('https://mindicador.cl/api');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    resultDiv.innerHTML = '';
    errorDiv.innerHTML = '';

    if (!amount) {
        errorDiv.innerHTML = 'Por favor, ingresa una cantidad válida';
        return;
    }

    const data = await fetchData();

    if (!data) {
        errorDiv.innerHTML = 'Error al obtener los datos de la API';
        return;
    }

    let conversionRate;

    switch (currency) {
        case 'dolar':
            conversionRate = data.dolar.valor;
            break;
        case 'euro':
            conversionRate = data.euro.valor;
            break;
        default:
            errorDiv.innerHTML = 'Moneda no soportada';
            return;
    }

    const convertedAmount = (amount / conversionRate).toFixed(2);
    resultDiv.innerHTML = `${amount} CLP = ${convertedAmount} ${currency.toUpperCase()}`;
    showChart(data[currency].codigo);
}

async function showChart(currencyCode) {
  try {
      const response = await fetch(`https://mindicador.cl/api/${currencyCode}`);
      const data = await response.json();

      const labels = data.serie.slice(0, 10).map(entry => new Date(entry.fecha).toLocaleDateString()).reverse();
      const values = data.serie.slice(0, 10).map(entry => entry.valor).reverse();

      const ctx = document.getElementById('myChart').getContext('2d');
      
      // Destruir el gráfico anterior si existe
      if (chart) {
          chart.destroy();
      }
      
      chart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: `Historial últimos 10 días (${currencyCode})`,
                  data: values,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: false
                  }
              }
          }
      });
  } catch (error) {
      console.error('Chart fetch error:', error);
      document.getElementById('error').innerHTML = 'Error al obtener los datos del gráfico';
  }
}