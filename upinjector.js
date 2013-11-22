var where;

var c = {};

var reguser = null;
function getPerson(){
    if (reguser !== null){
        return reguser;
    }
    c.address1 = $('input[name="new_address_street"]').val();
    c.zip = $('input[name="new_address_zipcode"]').val();
    c.city = $('input[name="new_address_city"]').val();
    c.fname = $('input[name="name.first"]').val();
    c.lname = $('input[name="name.last"]').val();
    c.moveDate = $('input[name="effective_date"]').val();
    c.email = $('input[name="new-email"]').val();

    console.log(c);
    return c;
}


function onStep (step, customer){
    if (step !== undefined){
//        var azcontmain = $('#cart-standard-content');
//        var azcont = $('#cart-standard-content');
//        if (step.name == 'teaser' && step.app == 'AZ'){
//            console.log('adding step 1 AZ');
//            //$('#bv_cart_cont').insertAfter($('#BUYBOX')); detail
//            $('#bv_cart_cont').insertBefore($('#cart-item-recs div:first')); //cart vert
//        }
//        else if (step.name == 'teaser' && step.app == 'AZ2')
//        {
//            console.log('adding step 1 AZ2');
//            var lst = $('#cartRecsButtonWrapper').find('ul');
//            lst.prepend($('#bv_cart_cont')); // cart hor
//        }
//        if (step.order == 2){
//            console.log('adding step 2');
////            $('#cart-standard-center').children().hide();
//            console.log($('#cart-upsell'));
//            $('#bv_cart_cont').insertAfter($('#cart-upsell'));
//
//        }
        console.log('onstep called');
        console.log(customer);
        if (step.name == 'offer' || step.name == "survey"){
            if (customer !== undefined){
                customer.email = $('input[name="new-email"]').val();
                console.log(customer);
            }
            $('#bv_cart_cont').insertBefore($('#dealForm'));
            $('#dealForm').remove();
        }
        if (step.name == 'teaser'){
            $('div.check-line').remove();
            $('#bv_cart_cont').prependTo($('.unlock-bullets')).fadeIn('slow');
        }
    }
}

$(document).ready(function(){
    console.log("document ready");

    $('.unlock-bullets').find('.big-button').replaceWith($('<button id="bv_launcher" class="button big-button">Show me the deals!</button>'));
    $('#bv_launcher').click(function(){
        launch();
    });

    $('input[name="effective_date"]').on('blur', function(){
        launch();
    });

//    $('input[name="name.last"]').on('blur', function(){
//        var m = $('input[name="name.middle"]');
//        console.log(m.val());
//        if (m.val() !== undefined && m.val() !== ''){
//        launch();
//        }
//    });

    function launch(){
        console.log("launching cart app");

        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms app-extension="1" cart-clr="btnClearForm" app-Type="Updater"></div><div id="bv_cart_cont" style="position:relative; max-height: 500px; width:70%; margin: auto; overflow-y: scroll; display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.appendTo('body');
        angular.bootstrap(d, ['cart']);
    }
});
