/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

var MongoClient = require('mongodb');
const dbCollection = "fcc-stock-price";
const  db = require('../db/database.js');
const ObjectId = require('mongodb').ObjectID;


const axios = require("axios");


const apiURLPrefix = "https://api.iextrading.com/1.0/stock/";
const apiURLSuffix = "/batch?types=price";
      
module.exports = function (app) {


db.connect(() => {
    app.listen(function (){
        console.log(`Database Listening`);
    });
  });
  
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      //console.log("Initial query " + JSON.stringify(req.query));
      var promiseArray = [];    //List of stocks to fetch
      var numberStocks = 0;
      if (req.query.hasOwnProperty('stock'))    //Check if a stock has been requested
      {        
        if (typeof(req.query.stock) != 'string')  //If more than one stock is requested we will receive an object / array, instead of a string
        {
          if (Object.keys(req.query.stock).length> 1)    //If we received a request for more than one stock, we are in the right place.
          {
            numberStocks =2;
            promiseArray.push(axios.get(apiURLPrefix + req.query.stock[0] + apiURLSuffix));
            promiseArray.push(axios.get(apiURLPrefix + req.query.stock[1] + apiURLSuffix));           
          }
          else
          {
            res.status(200).send('malformed request');    //Something was wrong with our request parameters
          }
        }
        else    //Otherwise we are only requesting a single stock
        {
          numberStocks = 1;
          promiseArray.push(axios.get(apiURLPrefix + req.query.stock + apiURLSuffix));       
        }
      }
      else
      {
        res.status(200).send('missing inputs');  //We didn't receive any requests for stocks.
        return;
      }


      Promise.all(promiseArray)  //Now we load the stock prices
      .then((stockPrices) =>  {     

        var likes = 0;
        var myquery={};
        var update={};
        var finalResponse ={};
        finalResponse.stockData = {};
         if (req.query.hasOwnProperty('like'))
         {
           //We must update the database for each like received - 1 like per stock per IP
           var ip = '';
           if (req.headers['x-forwarded-for'] != null) //Retrieve IP address 
           {
             ip=req.headers['x-forwarded-for'].split(',')[0];          
           }
           else
           {
             ip = req.connection.remoteAddress;
           }
           //console.log('IP is: ' + ip);
           if (req.query.like == 'true')
           {
             likes = 1;
             myquery["likeIP"] = {"$nin": [ip]};    //Don't append if IP already used
             update['$push'] = {"likeIP" :ip};  //Add IP to array of already likers
           }
          }          
          update['$inc'] = { 'likes': likes };
          var dbPromiseArray=[];
          if(numberStocks == 1)
          {
            myquery.symbol = req.query.stock.toUpperCase();
            
            finalResponse.stockData.stock = req.query.stock.toUpperCase();
            finalResponse.stockData.price = stockPrices[0].data.price.toString();

            dbPromiseArray.push(db.get().collection(dbCollection).findOne({'symbol':myquery.symbol}));
            Promise.all(dbPromiseArray)    
            .then((dbFindResults) => {
              dbPromiseArray.pop();
              if((dbFindResults[0] == null) && (likes > 0))  //No db entry yet for this symbol - We need to up upsert if we add a like upsert=true
              {
                  //console.log('Going to upsert');
                  dbPromiseArray.push(db.get().collection(dbCollection).updateOne(myquery, update, {upsert:true, multi:false}));                  
              }
              else if (likes > 0) //Record exists - Only update if we have IP-unique likes - upsert = false
              {
                //console.log('Going to update');
                dbPromiseArray.push(db.get().collection(dbCollection).updateOne(myquery, update, {upsert:false, multi:false}));
              }
              Promise.all(dbPromiseArray)
                .then((dbUpdateResults) => 
                {
                  if ((dbPromiseArray.length>0)&&(dbFindResults[0] != null))
                  {
                      if (dbUpdateResults[0].modifiedCount==0)    //If we didn't modify on the like update, then we didn't change the number of likes (IP same)
                      {
                        finalResponse.stockData.likes = dbFindResults[0].likes;
                      }
                      else    //Otherwise, we increase the value of the likes
                      {
                        finalResponse.stockData.likes = dbFindResults[0].likes + likes;
                      }
                  }
                  else  //Otherwise, zero likes or 1 like depending if likes = true
                  {
                    finalResponse.stockData.likes = likes;
                  }
                  //console.log(JSON.stringify(finalResponse));
                  res.status(200).send(finalResponse);
                })
                .catch((err) => 
                {
                  console.log(err + ' '  + JSON.stringify(req.query));
                  res.status(500).send("Database Error");  //Database failed to reply as expected, oh no
                });
              
              
            })
            .catch((err) => 
            {
              console.log(err + ' '  + JSON.stringify(req.query));
              res.status(500).send("Database Error");  //Database failed to reply as expected, oh no
            });
           
            
          }
          else    //Otherwise, we have 2 stocks (ignore more)
          {
            
            finalResponse.stockData = [{},{}];
            var maxStocks =2;
            for(var i = 0; i<maxStocks; ++i)
            {
              finalResponse.stockData[i].stock = req.query.stock[i].toUpperCase();
              finalResponse.stockData[i].price = stockPrices[i].data.price.toString();
              
              dbPromiseArray.push(db.get().collection(dbCollection).findOne({'symbol':finalResponse.stockData[i].stock}));
              
              
            }          
            
            Promise.all(dbPromiseArray)    
            .then((dbFindResults) => {
              dbPromiseArray.pop();
              dbPromiseArray.pop();
              for (var j = 0; j <maxStocks; ++j)
              {
                
                if((dbFindResults[j] == null) && (likes > 0))  //No db entry yet for this symbol - We need to up upsert if we add a like upsert=true
                {
                    //console.log('Going to upsert');
                    myquery.symbol = req.query.stock[j].toUpperCase();
                    dbPromiseArray.push(db.get().collection(dbCollection).updateOne(myquery, update, {upsert:true, multi:false}));                  
                }
                else if (likes > 0) //Record exists - Only update if we have IP-unique likes - upsert = false
                {
                  //console.log('Going to update');
                  myquery.symbol = req.query.stock[j].toUpperCase();
                  dbPromiseArray.push(db.get().collection(dbCollection).updateOne(myquery, update, {upsert:false, multi:false}));
                }
                
              }
              
              Promise.all(dbPromiseArray)
                .then((dbUpdateResults) => 
                {
                  for (var k =0; k < maxStocks; ++k)
                  {
                    if ((dbFindResults[k] != null))
                    {
                        if ((dbPromiseArray.length>k)&&(dbUpdateResults[k].modifiedCount==0))    //If we didn't modify one the like update, then we didn't change the number of likes (IP same)
                        {
                          finalResponse.stockData[k].likes = dbFindResults[k].likes;
                        }
                        else    //Otherwise, we increase the value of the likes
                        {
                          finalResponse.stockData[k].likes = dbFindResults[k].likes + likes;
                        }
                    }
                    else  //Otherwise, zero likes or 1 like depending if likes = true
                    {
                      finalResponse.stockData[k].likes = likes;
                    }
                    
                  }
                  //Calculate relative likes
                  finalResponse.stockData[0].rel_likes= finalResponse.stockData[0].likes - finalResponse.stockData[1].likes;
                  finalResponse.stockData[1].rel_likes= finalResponse.stockData[1].likes - finalResponse.stockData[0].likes;
                  delete finalResponse.stockData[0].likes;
                  delete finalResponse.stockData[1].likes;
                  
                  //console.log(JSON.stringify(finalResponse));
                  res.status(200).send(finalResponse);
                })
                .catch((err) => 
                {
                  console.log(err + ' '  + JSON.stringify(req.query));
                  res.status(500).send("Database Error");  //Database failed to reply as expected, oh no
                });
              
              
            })
            .catch((err) => 
            {
              console.log(err + ' '  + JSON.stringify(req.query));
              res.status(500).send("Database Error");  //Database failed to reply as expected, oh no
            });
          }
      })
      .catch((err) => {
        console.log(err + ' ' + JSON.stringify(req.query));        
        res.status(200).send("Error retrieving values from stock API -" + err);  //API failed to reply as expected, oh no
      });
    });
};
