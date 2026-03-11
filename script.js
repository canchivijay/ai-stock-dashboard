
// Uses Yahoo Finance chart API (no API key required)
// Works on GitHub Pages

async function fetchData(symbol){

try{

let url=`https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?range=3mo&interval=1d`;
let res=await fetch(url);

let data=await res.json();

let result=data.chart.result[0];

let closes=result.indicators.quote[0].close;
let highs=result.indicators.quote[0].high;
let lows=result.indicators.quote[0].low;

return {closes,highs,lows};

}catch(e){

alert("Failed to fetch stock data");
console.error(e);
return null;

}

}

function calcRSI(prices){

let gains=0;
let losses=0;

for(let i=1;i<prices.length;i++){

let diff=prices[i]-prices[i-1];

if(diff>0) gains+=diff;
else losses+=Math.abs(diff);

}

let rs=gains/(losses||1);
let rsi=100-(100/(1+rs));

return rsi.toFixed(2);
}

function calcEMA(values,period){

let k=2/(period+1);
let ema=values[0];

for(let i=1;i<values.length;i++){
ema=values[i]*k+ema*(1-k);
}

return ema;
}

function calcMACD(prices){

let ema12=calcEMA(prices,12);
let ema26=calcEMA(prices,26);

return (ema12-ema26).toFixed(2);
}

function supportResistance(highs,lows,close){

let pivot=(highs[0]+lows[0]+close)/3;

let resistance=(2*pivot)-lows[0];
let support=(2*pivot)-highs[0];

return [support.toFixed(2),resistance.toFixed(2)];
}

function signal(rsi,macd){

let intraday="HOLD";
let shortTerm="HOLD";
let longTerm="HOLD";

rsi=parseFloat(rsi);
macd=parseFloat(macd);

if(rsi<35 && macd>0){
intraday="BUY";
}

if(rsi>60 && macd>0){
shortTerm="BUY";
}

if(macd>1){
longTerm="BUY";
}

return [intraday,shortTerm,longTerm];
}

async function analyzeStock(){

let symbol=document.getElementById("symbolInput").value.trim();

if(!symbol){
alert("Enter stock symbol like RELIANCE.NS");
return;
}

let data=await fetchData(symbol);

if(!data){
alert("Stock not found");
return;
}

let prices=data.closes.filter(v=>v!=null).slice(-30).reverse();
let highs=data.highs.filter(v=>v!=null).slice(-30).reverse();
let lows=data.lows.filter(v=>v!=null).slice(-30).reverse();

let price=prices[0];

let rsi=calcRSI(prices);

let macd=calcMACD(prices);

let sr=supportResistance(highs,lows,price);

let signals=signal(rsi,macd);

document.getElementById("price").innerText=price.toFixed(2);
document.getElementById("rsi").innerText=rsi;
document.getElementById("macd").innerText=macd;

document.getElementById("intraday").innerText=signals[0];
document.getElementById("shortterm").innerText=signals[1];
document.getElementById("longterm").innerText=signals[2];

document.getElementById("support").innerText=sr[0];
document.getElementById("resistance").innerText=sr[1];

}
