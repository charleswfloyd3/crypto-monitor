const express = require('express')
const rp = require('request-promise');
const cheerio = require('cheerio');
require('dotenv').config();
const url = 'https://www.livecoinwatch.com/price/Bitcoin-BTC';
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
// twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);



const sendMessage = (btcPriceMessage) =>{
    client.messages.create({
          to: '14156848545',
          from: '+18025232154',
          body: `BTC: ${btcPriceMessage}`,
        })
        .then(console.log("message sent"));
}
const stockTracker = (btcLow, btcHigh) =>{rp(url)
  .then(function(html){
    let $ = cheerio.load(html)
    let btcPriceMessage = $('.coin-price-large').text().substr(0,10)
    let btcPrice = parseFloat($('.coin-price-large').text().substr(1,9))
    console.log(btcPrice);
    
    if(btcPrice <= btcLow ){
        sendMessage(`Bitcoin's price just dropped below $${btcLow} and is valued at: ${btcPriceMessage}`)
    }
    else if(btcPrice >= btcHigh){
        sendMessage(`Bitcoin's price just rose above $${btcHigh} and is valued at: ${btcPriceMessage}`)
    }
    })
  .catch(function(err){
    //handle error
    console.log(err)
  });
  setTimeout(stockTracker, 10000)

};
readline.question('If BTC drops below $( ... ) notify me: ', btcLow => {
    console.log(`Great, if BTC drops below $${btcLow} we'll notify you!`);
    readline.question("If BTC goes up to $( ... ) notify me: ", btcHigh =>{
    console.log(`Great, if BTC rises to $${btcHigh} we'll notify you!`);
    stockTracker(btcLow, btcHigh);
    readline.close();

    })
    // readline.close();

});