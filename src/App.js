import React, { useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './App.css';

// const websocketUrl = 'ws://192.168.0.180:8000/charts';
const coinbaseWSUrl = 'wss://ws-feed.pro.coinbase.com';
const currencyPairsUrl = 'https://api.pro.coinbase.com/products';
const chartOptions = {
  priceScale: {
    position: 'right',
    autoScale: true,
    invertScale: false,
    alignLabels: true,
    borderVisible: true,
    borderColor: '#000',
    scaleMargins: {
      top: 0.30,
      bottom: 0.25,
    },
  },
  priceFormat: {
    precision: 8
  },
  timeScale: {
    rightOffset: 12,
    barSpacing: 3,
    fixLeftEdge: false,
    lockVisibleTimeRangeOnResize: true,
    rightBarStaysOnScroll: true,
    borderVisible: false,
    borderColor: '#fff000',
    visible: true,
    timeVisible: true,
    secondsVisible: true,
  },
  layout: {
    backgroundColor: '#282c34',
    textColor: '#696969',
    fontSize: 12,
    fontFamily: 'Calibri',
  },
};

// const isDST = (d) => {
//   let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
//   let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
//   console.log(Math.max(jan, jul) != d.getTimezoneOffset());
// }

// const cbws = new WebSocket(coinbaseWSUrl);
//
// cbws.onopen = () => {
//   cbws.send(JSON.stringify(
//     {
//       "type": "subscribe",
//       "product_ids": ["ETH-USD"],
//       "channels": ["ticker"]
//     }
//   ));
// }
//
// cbws.onmessage = event => {
//   console.log(JSON.parse(event.data));
// }

function App() {
  return (
    <div>
      <LineChart />
    </div>
  );
}

function LineChart() {

  const [currencyPair, setPair] = useState('BTC-USD');
  const [chartRendered, setRendered] = useState(false);
  const [currencyPairs, setPairs] = useState([]);

  useEffect(() => {
    if (currencyPairs.length < 1) {
      fetch(currencyPairsUrl)
      .then(res => res.json())
      .then(json => {
        const pairArr = [];
        for (const item in json) {
          pairArr.push(json[item].id);
        }
        pairArr.sort();
        setPairs(pairArr);
      })
      .catch(error => console.log(error));
    }
    if (chartRendered) {
      document.getElementById('test').firstChild.remove();
    }
    let width = window.innerWidth;
    let height = window.innerHeight;
    const ws = new WebSocket(coinbaseWSUrl);
    const chart = createChart(
      document.getElementById('test'),
      { width: width, height: height - 100}
    );
    const areaSeries = chart.addAreaSeries({title: currencyPair});
    chart.applyOptions(chartOptions);
    ws.onopen = () => {
      ws.send(JSON.stringify(
        {
          'type': 'subscribe',
          'product_ids': currencyPairs,
          'channels': ['ticker']
        }
      ));
    }
    ws.onmessage = event => {
      const chartData = JSON.parse(event.data);
      const date = new Date();
      const offset = date.getTimezoneOffset();
      const timestamp = date.getTime() / 1000 - offset*60;
      if (chartData.type === 'ticker' && chartData.product_id === currencyPair) {
        areaSeries.update({time: timestamp, value: parseFloat(chartData.price, 10)});
      }
    };
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      chart.resize(height, width);
    });
    setRendered(true);
  }, [currencyPair, chartRendered, currencyPairs]);

  return (
    <div>
      <div id='test'></div>
      <div>
        <select value={currencyPair} onChange={(event) => setPair(event.target.value)}>
         {currencyPairs.map((item, i) => <option key={`${item}${i}`} value={item}>{item}</option>)}
        </select>
      </div>
    </div>
  );
}

export default App;

///////////////////////////////////////

// if (chartData.chart) {
//   for (const item in chartData.chart) {
//     chartData.chart[item].time = Math.floor(chartData.chart[item].time / 1000)
//   }
//   areaSeries.setData(chartData.chart);
// } else if (!chartData.chart) {
//   chartData.time = Math.floor(chartData.time / 1000)
//   areaSeries.update(chartData);
// }
