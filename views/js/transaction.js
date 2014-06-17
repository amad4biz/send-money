'use strict';

(function() {

    var $back        = $('.back'),
        $currency    = $('.currency-dropdown'),
        $transaction = $('.transaction');

    var setCurrentCurrency = function setCurrentCurrency() {
        $currency.each(function() {
            var $this   = $(this),
                current = $this.closest('.transaction').find('.amount').data('currency');
            $this.find('option[value=' + current + ']').prop('selected',true);
        });
    }.call(this);

    $back.bind('click',function() {
        window.history.back();
    });

    $transaction.bind('click', function() {
        var $this = $(this);
        $('.show-details').not($this).removeClass('show-details');
        $this.toggleClass('show-details');
    });

    $currency.bind('change',function() {

        var $this           = $(this),
            $column         = $this.closest('.transaction').find('.amount-column'),
            $symbol         = $column.find('.symbol'),
            $amount         = $column.find('.amount'),
            amount          = parseFloat($amount.text().replace(/,/g,'')),
            currentCurrency = $amount.data('currency'),
            newCurrency     = $this.val(),
            query           = 'currencyConversion/' + amount + '/' + currentCurrency + '/' + newCurrency + '/JSON';

        var req = $.ajax({ url: query, type: 'GET' }).done(function(result) {
            $amount.data('currency',newCurrency);
            $amount.text(result.amount);
            $symbol.text(result.symbol);
        });

    });

})();

