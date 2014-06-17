// Dependencies

var express = require('express'),
    app = express(),
    Q = require('q'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    kleiDust = require('klei-dust'),
    dust = require('dustjs-linkedin'),
    helpers = require('dustjs-helpers'),
    extend = require('extend'),
    numeral = require('numeral'),
    xchange = require('xchange'),
    path = require('path');

// Configs

var server = app.listen(1338, function() {
    console.log('Listening on port %d', server.address().port);
});

app.set('view engine','dust');
app.set('views', __dirname + '/views');
app.engine('dust',kleiDust.dust);

kleiDust.setHelpers(helpers);
kleiDust.setOptions({'useHelpers':true});

app.use(bodyParser.urlencoded());

app.use('/js', express.static(path.join(__dirname, 'views/js')));
app.use('/img', express.static(path.join(__dirname, 'views/img')));
app.use('/style', express.static(path.join(__dirname, 'views/style')));

var transactionsPath = path.join(__dirname,'transactions.data.json');

var getTransaction = function() {
    if(fs.existsSync(transactionsPath))
        return JSON.parse(fs.readFileSync(transactionsPath));
    return [];
}

var saveTransaction = function(reqBody) {
    var transData = getTransaction();
    transData.push(reqBody);
    fs.writeFileSync(transactionsPath,JSON.stringify(transData));
}

// Routes

app.get('/paypal', function(req,res) {
    res.render('main',{ page:'main' });
});

app.post('/paypal/save', function(req,res) {
    try {
        saveTransaction(req.body);
        res.send(200);
    } catch(e) {
        console.error(e);
        res.send(400);
    }
});

app.get('/paypal/sendMoney', function(req,res) {
    var countries   = xchange.getListSymbols(),
        dustData = [];

    for(var name in countries) {
        dustData.push({ name:name,symbol:countries[name].symbol });
    }

    res.render('sendMoney.dust',{ page:'sendMoney',countries:dustData });
});

app.get('/paypal/activity', function(req,res) {

    var transData = getTransaction(),
        countries = xchange.getListSymbols(),
        dustData  = [];

    for(var name in countries) {
        dustData.push({ name:name,symbol:countries[name].symbol });
    }

    transData.forEach(function(data) {
        data['symbol'] = xchange.getSymbol(data.currency);
    });

    res.render('transaction.dust',{ page:'activity',transactions:transData,countries:dustData });
});

app.get('/paypal/currencyConversion/:amount/:from/:to/:format?', function(req,res) {
    var amount = req.params.amount,
        from   = req.params.from,
        to     = req.params.to,
        format = req.params.format;

    xchange.convert(amount,from,to).then(function(amount) {
        if(format === 'JSON') {
            res.json({ symbol:xchange.getSymbol(to), amount:numeral(amount).format('0,0.00') });
        } else {
            res.send(xchange.getSymbol(to) + numeral(amount).format('0,0.00'));
        }
    });
});

app.get('/paypal/conversionRate/:from/:to', function(req,res) {
    var from  = req.params.from,
        to    = req.params.to;
    xchange.getConversionRate(from,to).then(function(conversionRate) {
        res.send(conversionRate.toString());
    });
});


