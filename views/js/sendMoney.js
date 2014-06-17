'use strict';

(function() {

    var $recipient = $('#recipient'),
        $amount    = $('#amount'),
        $currency  = $('.currency-dropdown'),
        $message   = $('#message'),
        $purpose   = $('#money-purpose'),
        $radios    = $('.purpose'),
        $form      = $('#send-money'),
        $symbol    = $('#symbol-label');

    var getDateFormat = function getDateFormat(date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    },

    sendSuccess = function sendSuccessCallback() {
        window.location.replace(window.location.origin + '/paypal/activity');
    },

    sendFail = function sendSuccessCallback () {
        console.error('Error occurred while saving.');
    },

    saveTransaction = function saveTransaction() {
        var request,date,data,options,request;
        date = getDateFormat( new Date() );
        data = {
            date     : date,
            recipient: $recipient.val(),
            amount   : $amount.val(),
            message  : $message.val(),
            currency : $currency.val(),
            purpose  : $radios.filter(':checked').val()
        };
        options = { url:'save', type: 'POST', data: data };
        request = $.ajax(options).then(sendSuccess,sendFail);
    },

    clear = function clear() {
        $recipient.add($message).val('');
        $currency.find('option').first().prop('selected',true);
        $amount.val(0).trigger('change');
        $radios.first().prop('checked',true).trigger('change');
    };

    $currency.bind('change',function() {
        var symbol = $(this).find('option:selected').data('symbol');
        $symbol.text(symbol);
    });

    $amount.bind('change blur',function() {
        var amount = 0;
        if(!this.value.length || isNaN(amount = parseFloat(this.value.replace(/,/g,'')))) {
            this.value = 0;
        }
        this.value = numeral(parseFloat(this.value.replace(/,/g,''))).format('0,0.00');
        $currency.trigger('change');
    }).trigger('change');

    $radios.bind('change', function() {
        $('.checked').removeClass('checked');
        $(this).closest('li').addClass('checked');
    });

    $('.clear').bind('click',clear);

    $('input[type=submit]').bind('click',saveTransaction);

    $recipient.focus();

    $currency.find('option[value=USD]').prop('selected',true).trigger('change');

})();


