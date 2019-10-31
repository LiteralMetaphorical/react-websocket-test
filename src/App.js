import React, { useState, useEffect } from 'react';
import { createChart } from 'lightweight-charts';
import './App.css';

const websocketUrl = 'ws://localhost:8000/charts';

function App() {

  const [count, setCount] = useState(0);
  const [chartRendered, setChartRendered] = useState(false);

  useEffect(() => {
    if (!chartRendered) {
      const ws = new WebSocket(websocketUrl);
      ws.onmessage = event => {
        let chartData = JSON.parse(event.data);
        chartData = chartData.chart;
        // console.log(chartData);
        for (const item in chartData) {
          // chartData[item].time = chartData[item].time.substr(0, 10);
        }
        console.table(chartData);
        if (chartData) {
          const chart = createChart(document.getElementById('test'), { width: 600, height: 300 });
          const lineSeries = chart.addLineSeries();
          lineSeries.setData(chartData);
        }
      };
      // lineSeries.setData([
      //     { time: '2019-04-11', value: 80.01 },
      //     { time: '2019-04-12', value: 96.63 },
      //     { time: '2019-04-13', value: 76.64 },
      //     { time: '2019-04-14', value: 81.89 },
      //     { time: '2019-04-15', value: 74.43 },
      //     { time: '2019-04-16', value: 80.01 },
      //     { time: '2019-04-17', value: 96.63 },
      //     { time: '2019-04-18', value: 76.64 },
      //     { time: '2019-04-19', value: 81.89 },
      //     { time: '2019-04-20', value: 74.43 },
      // ]);
      setChartRendered(true);
    }
  });

  const increaseCount = () => {
    setCount(count + 1);
  }

  return (
    <div>
      <p>You've pressed the button {count} times</p>
      <button onClick={increaseCount}>+1</button>
      <div id='test'></div>
    </div>
  );
}

export default App;
