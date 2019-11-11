import React, { useEffect, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './App.css';

// const websocketUrl = 'ws://192.168.0.180:8000/charts';
const candleStickUrl = 'ws://localhost:8000/candela';

const candleWs = new WebSocket(candleStickUrl);

candleWs.onopen = () => {
  console.log('opened')
}

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

function App() {
  return (
    <div>
      <LineChart />
      <CandleChart />
    </div>
  );
}

function LineChart() {

  const [currencyPair, setPair] = useState('BTC-USD');
  const [chartRendered, setRendered] = useState(false);
  const [currencyPairs, setPairs] = useState([]);
  const [wsOpened, setWsOpened] = useState(false);
  const [count, increaseCount] = useState(0);

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
      document.getElementById('line-chart').firstChild.remove();
    }
    let width = window.innerWidth;
    let height = window.innerHeight;
    const ws = new WebSocket(coinbaseWSUrl);
    setWsOpened(true);
    const chart = createChart(
      document.getElementById('line-chart'),
      { width: width - 17, height: height - 100}
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
  }, [currencyPair, chartRendered, currencyPairs, wsOpened]);

  return (
    <div>
      <div id='line-chart'></div>
      <div>
        <select value={currencyPair} onChange={(event) => setPair(event.target.value)}>
         {currencyPairs.map((item, i) => <option key={`${item}${i}`} value={item}>{item}</option>)}
        </select>
        <button onClick={() => increaseCount(count + 1)}>count +1</button>
        <p>{count}</p>
      </div>
    </div>
  );
}

function CandleChart() {

  const [chartRendered, setRendered] = useState(false);

  useEffect(() => {
    let candlestickSeries = undefined;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const chart = createChart(
      document.getElementById('candle-chart'),
      { width: width - 17, height: height - 100}
    );
    chart.applyOptions({
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
      }
    })
    candlestickSeries = chart.addCandlestickSeries({title: 'candle'});
    candleWs.onmessage = (message) => {
      let chartData = JSON.parse(message.data).candela;
      if (chartData.length > 1) {
        console.log(chartData);
        candlestickSeries.setData(chartData);
      } else if (chartData.length <= 1) {
        console.log(chartData);
        candlestickSeries.update(chartData[0]);
      }
    }
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      chart.resize(height, width);
    });
  }, [chartRendered]);

  return(
    <div id='candle-chart'></div>
  )
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


///////////////////////////////////////

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
