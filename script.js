async function fetchData(symbol){

symbol = symbol.toLowerCase()

let url = `https://stooq.com/q/d/l/?s=${symbol}.in&i=d`

let res = await fetch(url)

let text = await res.text()

let rows = text.split("\n")

rows.shift()

let prices=[]

for(let r of rows){

let cols=r.split(",")

if(cols.length>4){

prices.push(parseFloat(cols[4]))

}

}

return prices.reverse()

}

function calcRSI(prices){

let gains=0
let losses=0

for(let i=1;i<prices.length;i++){

let diff=prices[i]-prices[i-1]

if(diff>0) gains+=diff
else losses+=Math.abs(diff)

}

let rs=gains/(losses||1)

return (100-(100/(1+rs))).toFixed(2)

}

function calcEMA(values,period){

let k=2/(period+1)

let ema=values[0]

for(let i=1;i<values.length;i++){

ema=values[i]*k+ema*(1-k)

}

return ema

}

function calcMACD(prices){

let ema12=calcEMA(prices,12)

let ema26=calcEMA(prices,26)

return (ema12-ema26).toFixed(2)

}

function aiSignal(rsi,macd){

if(rsi<35 && macd>0) return "BUY"

if(rsi>65 && macd<0) return "SELL"

return "HOLD"

}

let chart

function drawChart(prices){

let ctx=document.getElementById("chart")

if(chart) chart.destroy()

chart=new Chart(ctx,{

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

async function analyzeStock(){

let symbol=document.getElementById("symbolInput").value.trim()

if(!symbol){

alert("Enter stock")

return

}

let prices=await fetchData(symbol)

let price=prices[prices.length-1]

let rsi=calcRSI(prices)

let macd=calcMACD(prices)

let signal=aiSignal(rsi,macd)

document.getElementById("price").innerText=price

document.getElementById("rsi").innerText=rsi

document.getElementById("macd").innerText=macd

document.getElementById("signal").innerText=signal

drawChart(prices)

}
