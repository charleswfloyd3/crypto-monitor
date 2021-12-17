//express server
const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
//requests for coin data
const rp = require('request-promise');
const cheerio = require('cheerio');
require('dotenv').config();

// twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


app.get('/', function(req,res){
  res.send("working...")
})
app.get('/coinqueried', function(req,res){
  res.send("coin page")
})
const sendMessage = (coinNotification, userPhonenumber) =>{
  let messageStatus = "not sent"
  try{
    client.messages .create({ 
      body:coinNotification,
      from: '+18025232154',
      to: '+14156848545', 

    }) 
   .then(messageStatus = 'already sent') 
   .done();
  }
 catch{
   console.log('erroe')
 }
return messageStatus;

}

app.post("/userparameters", async (req, res) =>{
  try{
      console.log("req.body: " , req.body);
      const userParameters = ({
          id: req.body.id,
          symbol: req.body.symbol,
          image: req.body.image,
          highprice: req.body.highprice,
          lowprice: req.body.lowprice,
          fullname: req.body.name ,
          phonenumber: req.body.phonenumber
      });
      let url = `https://www.livecoinwatch.com/price/${userParameters.fullname + userParameters.symbol}`
     
      const stockTracker = (userParameters, messageStatus) =>{
        rp(url).then(function(html){
          let $ = cheerio.load(html)
          let coinPriceMessage = $('.coin-price-large').text().substr(0,9)
          let coinPrice = parseFloat($('.coin-price-large').text().substr(1,9))
          let coinLow = userParameters.lowprice
          let coinHigh = userParameters.highprice

          console.log(coinPrice)
          console.log(messageStatus)
          if(messageStatus == 'message already sent'){

          }
          else{
          if(coinPrice <= coinLow ){
              sendMessage(`${userParameters.fullname}'s price just dropped below $${coinLow} and is valued at: ${coinPriceMessage} ${url}`, userParameters.phonenumber);
          }
          else if(coinPrice >= coinHigh){
              sendMessage(`${userParameters.fullname}'s price just rose above $${coinHigh} and is valued at: ${coinPriceMessage} ${url}`, userParameters.phonenumber)
              
          }
        }
          })

        .catch(function(err){
          //handle error
          console.log(err)
        });
        
      }; 
      const loopStockTracker = () =>{
        let messageSituation = sendMessage()
        stockTracker(userParameters, messageSituation)

        setTimeout(loopStockTracker, 5000)
      }
      loopStockTracker()
  }
  catch(error){
      console.log(error)
  }
})
app.listen(process.env.PORT || 5000 )


