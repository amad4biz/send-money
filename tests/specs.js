var xchange = require('xchange'),
    assert  = require('assert'),
    path    = require('path'),
    https   = require('https'),
    http    = require('http'),
    numeral = require('numeral'),
    fs      = require('fs');

describe('Currency Sybmol',function() {
    it('should return the corresponding currency symbol for the given country (USA)', function() {
        assert.equal(xchange.getSymbol('USD'),'$');
    });
});

describe('Rate Conversion',function() {

    var rateTable, yResult;

    it('should have a parsable JSON rate table', function() {
        try {
            rateTable = JSON.parse(fs.readFileSync(path.join(process.cwd(),'./exchangeData.json')));
        } catch(err) {
            throw err;
        }
    });

    describe('match from static file', function() {

        it('should return the corresponding exchange rate between the two given countries (USA and Japan)', function(done) {
            xchange.getConversionRate('USD','JPY',true).done(function(conversionRate) {
                assert.equal(conversionRate,rateTable['JPY'].rate);
                done();
            });
        });

    });

    describe('match from Yahoo Financial API', function() {

        var reques, query, options, yRate, hostname = 'query.yahooapis.com';

        beforeEach(function(done) {

            query = 'select * from yahoo.finance.xchange where pair in ("USDJPY")';

            options = {
                hostname: hostname,
                path: '/v1/public/yql?q=' + encodeURIComponent(query) + '&format=json&diagnostics=false&env=store://datatables.org/alltableswithkeys&callback=',
                method: 'GET'
            };

            req = https.request(options, function(res) {

                if(res.statusCode !== 200) throw new Error('Error retrieving data from Yahoo Financial API.');

                res.on('data', function(data) {
                  yResult = JSON.parse(data);
                  yRate   = yResult['query']['results']['rate']['Rate'];
                  done();
                });

            });

            req.end();

            req.on('error',function() {
                throw new Error('Error connecting to Yahoo Financial API.');
            });

        });

        it('should return the corresponding exchange rate between the two given countries (USA and Japan)', function(done) {
            xchange.getConversionRate('USD','JPY').done(function(conversionRate) {
                assert.equal(yRate,conversionRate);
                done();
            });
        });

        describe('for web services',function() {

            var factoredAmount = 1000.56;

            describe('GET request /paypal/currencyConversion/' + factoredAmount + '/USD/JPY', function() {
                it('should return the correct amount and symbol of the given country (Japan)', function(done) {

                    var options = {
                        host:'localhost',
                        port: 1338,
                        path: '/paypal/currencyConversion/' + factoredAmount + '/USD/JPY',
                        agent: false
                    };

                    var expected = numeral(yRate * factoredAmount).format('0,0.00');

                    http.get(options, function(res) {
                        res.on('data',function(data) {
                            assert.equal(data.toString(),'¥' + expected);
                        });
                        done();
                    });
                });
            });

            describe('GET request /paypal/currencyConversion/' + factoredAmount + '/USD/JPY/JSON', function() {
                it('should return the correct amount and symbol of the given country (Japan)', function(done) {

                    var options = {
                        host:'localhost',
                        port: 1338,
                        path: '/paypal/currencyConversion/' + factoredAmount + '/USD/JPY/JSON',
                        agent: false
                    };

                    var expected = numeral(yRate * factoredAmount).format('0,0.00');

                    http.get(options, function(res) {
                        res.on('data',function(data) {
                            var data = JSON.parse(data);
                            assert.equal(expected, data.amount);
                        });
                        done();
                    });
                });
            });

            describe('GET request /paypal/conversionRate/USD/JPY', function() {
                it('should return the exchange rate of the given country (Japan)', function(done) {

                    var options = {
                        host:'localhost',
                        port: 1338,
                        path: '/paypal/conversionRate/USD/JPY',
                        agent: false
                    };

                    http.get(options, function(res) {
                        res.on('data',function(data) {
                            assert.equal(data.toString(),yRate);
                        });
                        done();
                    });
                });
            });

        });

    });

});