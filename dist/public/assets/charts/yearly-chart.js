// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Bar Chart Example
var ctx = document.getElementById("myBarChart");
let xAxis;
let data;
await fetch("/api/statistical/yearly-chart", {
  mode: "cors",
  method: "get",
  headers: {
    'accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}).then(r => r.json()).then(r => {
  xAxis = r.xAxis
  data = r.data
})
let min = Math.min(...data)
let max = Math.max(...data)
var myLineChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: xAxis,
    datasets: [{
      label: "Tổng thu nhập",
      backgroundColor: "rgba(2,117,216,1)",
      borderColor: "rgba(2,117,216,1)",
      data: data,
    }],
  },
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'month'
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: max + max * 0.1,
          maxTicksLimit: 5
        },
        gridLines: {
          display: true
        }
      }],
    },
    legend: {
      display: false
    }
  }
});
