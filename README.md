**FreeCodeCamp**- Information Security and Quality Assurance
------

Project Stock Price Checker

1) SET NODE_ENV to `test` without quotes and set DB to your mongo connection string
2) Complete the project in `routes/api.js` or by creating a handler/controller
3) You will add any security features to `server.js`
4) You will create all of the functional tests in `tests/2_functional-tests.js`


## USE https://juvenile-leather.glitch.me/ to test (Fixed ISQ5 functionality)

## User Stories
- Set the content security policies to only allow loading of scripts and css from your server.
- I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData.
- In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
- I can also pass along field like as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted.
- If I pass along 2 stocks, the return object will be an array with both stock's info but instead of likes, it will display rel_likes(the difference between the likes on both) on both.
- A good way to receive current price is the following external API(replacing 'GOOG' with your stock): https://finance.google.com/finance/info?q=NASDAQ%3aGOOG

But since Google Stopped supporting this protocol, we are, instead, using the API at 
https://iextrading.com/developer/



All 5 functional tests are complete and passing.
## Example usage:
/api/stock-prices?stock=goog
/api/stock-prices?stock=goog&like=true
/api/stock-prices?stock=goog&stock=msft
/api/stock-prices?stock=goog&stock=msft&like=true
## Example return:
{"stockData":{"stock":"GOOG","price":"786.90","likes":1}}
{"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}
