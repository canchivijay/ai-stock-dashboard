async function fetchData(symbol){

symbol = symbol.toUpperCase()

if(!symbol.includes(".NS")){
symbol = symbol + ".NS"
}

let url = `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=3mo&interval=1d`

let res = await fetch(url)

let data = await res.json()

let result = data.chart.result[0]

return {

prices: result.indicators.quote[0].close,
highs: result.indicators.quote[0].high,
lows: result.indicators.quote[0].low

}

}

function calcRSI(prices){

let gains = 0
let losses = 0

for(let i=1;i<prices.length;i++){

let diff = prices[i] - prices[i-1]

if(diff>0) gains += diff
else losses += Math.abs(diff)

}

let rs = gains / (losses || 1)

return (100 - (100/(1+rs))).toFixed(2)

}

function calcEMA(values,period){

let k = 2/(period+1)

let ema = values[0]

for(let i=1;i<values.length;i++){

ema = values[i]*k + ema*(1-k)

}

return ema

}

function calcMACD(prices){

let ema12 = calcEMA(prices,12)

let ema26 = calcEMA(prices,26)

return (ema12 - ema26).toFixed(2)

}

function supportResistance(highs,lows,close){

let pivot = (highs[0] + lows[0] + close) / 3

let resistance = (2*pivot) - lows[0]

let support = (2*pivot) - highs[0]

return [support.toFixed(2), resistance.toFixed(2)]

}

function signal(rsi,macd){

let intraday="HOLD"
let shortTerm="HOLD"
let longTerm="HOLD"

if(rsi<35 && macd>0) intraday="BUY"

if(rsi>60 && macd>0) shortTerm="BUY"

if(macd>1) longTerm="BUY"

return [intraday,shortTerm,longTerm]

}

async function analyzeStock(){

let symbol = document.getElementById("symbolInput").value.trim()

if(!symbol){

alert("Enter NSE stock name")

return

}

let data = await fetchData(symbol)

let prices = data.prices.filter(x=>x!=null).slice(-60)

let highs = data.highs.filter(x=>x!=null).slice(-60)

let lows = data.lows.filter(x=>x!=null).slice(-60)

let price = prices[prices.length-1]

let rsi = calcRSI(prices)

let macd = calcMACD(prices)

let sr = supportResistance(highs,lows,price)

let signals = signal(rsi,macd)

document.getElementById("price").innerText = price.toFixed(2)

document.getElementById("rsi").innerText = rsi

document.getElementById("macd").innerText = macd

document.getElementById("intraday").innerText = signals[0]

document.getElementById("shortterm").innerText = signals[1]

document.getElementById("longterm").innerText = signals[2]

document.getElementById("support").innerText = sr[0]

document.getElementById("resistance").innerText = sr[1]

drawChart(prices)

}

function drawChart(prices){

let ctx = document.getElementById("chart")

new Chart(ctx,{

type:"line",

data:{

labels:prices.map((_,i)=>i),

datasets:[{

label:"Price",

data:prices

}]

}

})

}
