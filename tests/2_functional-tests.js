/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    var case1Likes = 0;
    var case2Likes = 0;
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          //complete this one too
           assert.equal(res.status, 200);
           assert.property(res.body, 'stockData', 'Response should contain stockData');
           assert.isObject(res.body.stockData, 'stockData should be an object');
         
           assert.property(res.body.stockData, 'stock', 'stockData should contain stock');
           assert.property(res.body.stockData, 'price', 'stockData should contain price');
           assert.property(res.body.stockData, 'likes', 'stockData should contain likes');
         
           assert.isString(res.body.stockData.stock, 'stock should be a string');
           assert.isString(res.body.stockData.price, 'price should be a string');
           assert.isNumber(res.body.stockData.likes, 'likes should be a number');
           case1Likes = res.body.stockData.likes;
           assert.equal(res.body.stockData.stock, 'GOOG', 'stock should be capitilized symbol');
           
           
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',
               like: 'true'})
        .end(function(err, res){
          
          //complete this one too
           assert.equal(res.status, 200);
           assert.property(res.body, 'stockData', 'Response should contain stockData');
           assert.isObject(res.body.stockData, 'stockData should be an object');
         
           assert.property(res.body.stockData, 'stock', 'stockData should contain stock');
           assert.property(res.body.stockData, 'price', 'stockData should contain price');
           assert.property(res.body.stockData, 'likes', 'stockData should contain likes');
         
           assert.isString(res.body.stockData.stock, 'stock should be a string');
           assert.isString(res.body.stockData.price, 'price should be a string');
           assert.isNumber(res.body.stockData.likes, 'likes should be a number');
                   
           assert.equal(res.body.stockData.stock, 'GOOG', 'stock should be capitilized symbol');    
            if (case1Likes > 0)
            {
             assert.isAtLeast(res.body.stockData.likes, case1Likes, 'likes should be at least as much as before');     //If we ran this test before, there is a good chance it will not get counted, unless DB is cleared
            }
            else
            {
              assert.isAtLeast(res.body.stockData.likes, 1, 'likes should be at least as much as 1');     //If this is the first time we liked this stock, it should have a value of 1
            }
           case1Likes = res.body.stockData.likes;
          done();
        });
        
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog',
               like: 'true'})
        .end(function(err, res){
          
          //complete this one too
           assert.equal(res.status, 200);
           assert.property(res.body, 'stockData', 'Response should contain stockData');
           assert.isObject(res.body.stockData, 'stockData should be an object');
         
           assert.property(res.body.stockData, 'stock', 'stockData should contain stock');
           assert.property(res.body.stockData, 'price', 'stockData should contain price');
           assert.property(res.body.stockData, 'likes', 'stockData should contain likes');
         
           assert.isString(res.body.stockData.stock, 'stock should be a string');
           assert.isString(res.body.stockData.price, 'price should be a string');
           assert.isNumber(res.body.stockData.likes, 'likes should be a number');
                   
           assert.equal(res.body.stockData.stock, 'GOOG', 'stock should be capitilized symbol');          
           assert.equal(res.body.stockData.likes, case1Likes, 'likes should not chang eon double vote');          
           done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end(function(err, res){
          
          //complete this one too
           assert.equal(res.status, 200);
           assert.property(res.body, 'stockData', 'Response should contain stockData');
           assert.isArray(res.body.stockData, 'stockData should be an array');
           assert.equal(res.body.stockData.length, 2,  'stockData should be an array of length 2');
          
            for (var i=0; i<res.body.stockData.length; ++i)
            {
             assert.property(res.body.stockData[i], 'stock', 'Each stockData entry should contain stock');
             assert.property(res.body.stockData[i], 'price', 'Each stockData entry should contain price');
             assert.property(res.body.stockData[i], 'rel_likes', 'Each stockData entry should contain rel_likes');

             assert.isString(res.body.stockData[i].stock, 'stock should be a string');
             assert.isString(res.body.stockData[i].price, 'price should be a string');
             assert.isNumber(res.body.stockData[i].rel_likes, 'rel_likes should be a number');          

            }
            assert.equal(res.body.stockData[0].stock, 'GOOG', 'stock should be capitilized symbol');
            assert.equal(res.body.stockData[1].stock, 'MSFT', 'stock should be capitilized symbol');
            assert.equal(res.body.stockData[1].rel_likes, -1*res.body.stockData[0].rel_likes, 'relative likes should be inverse of each other');
            done();
        });

      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'],
               like: 'true'}
              )
        .end(function(err, res){
          
          //complete this one too
           assert.equal(res.status, 200);
           assert.property(res.body, 'stockData', 'Response should contain stockData');
           assert.isArray(res.body.stockData, 'stockData should be an array');
           assert.equal(res.body.stockData.length, 2,  'stockData should be an array of length 2');
          
            for (var i=0; i<res.body.stockData.length; ++i)
            {
            
             assert.property(res.body.stockData[i], 'stock', 'Each stockData entry should contain stock');
             assert.property(res.body.stockData[i], 'price', 'Each stockData entry should contain price');
             assert.property(res.body.stockData[i], 'rel_likes', 'Each stockData entry should contain rel_likes');

             assert.isString(res.body.stockData[i].stock, 'stock should be a string');
             assert.isString(res.body.stockData[i].price, 'price should be a string');
             assert.isNumber(res.body.stockData[i].rel_likes, 'likes should be a number');  
            }
            assert.equal(res.body.stockData[0].stock, 'GOOG', 'stock should be capitilized symbol');
            assert.equal(res.body.stockData[1].stock, 'MSFT', 'stock should be capitilized symbol');
            assert.equal(res.body.stockData[1].rel_likes, -1*res.body.stockData[0].rel_likes, 'relative likes should be inverse of each other');
          
            done();
        });

      });
      
    });

});
