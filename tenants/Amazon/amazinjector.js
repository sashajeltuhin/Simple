var where;

var c = {};
c.leadprodprice = 0;

var reguser = null;
function getPerson(){
    if (reguser !== null){
        return reguser;
    }
//    c.address1 = $('#bv_address1').val();
//    c.appt = $('#bv_appt').val();
//    c.zip = $('#bv_zip').val();
//    c.moveDate = $('#bv_moveDate').val();
//    c.state = $('#bv_state').val();
//    c.city = $('#bv_city').val();

    console.log(c);
    return c;
}


function onStep (step){
    if (step !== undefined){
        var azcontmain = $('#cart-standard-content');
        var azcont = $('#cart-standard-content');
        if (step.name == 'teaser' && step.app == 'AZ'){
            console.log('adding step 1 AZ');
            //$('#bv_cart_cont').insertAfter($('#BUYBOX')); detail

            //$('#bv_cart_cont').insertBefore($('#cart-item-recs div:first')); //cart vert
            $('#bv_cart_cont').insertAfter($('#cart-gutter'));
        }
        else if (step.name == 'teaser' && step.app == 'AZ2')
        {
            console.log('adding step 1 AZ2');
            var lst = $('#cartRecsButtonWrapper').find('ul');
            lst.prepend($('#bv_cart_cont')); // cart hor
        }
        if (step.order == 2){
            console.log('adding step 2');
//            $('#cart-standard-center').children().hide();
            console.log($('#cart-upsell'));
            $('#bv_cart_cont').insertAfter($('#cart-upsell'));

        }
    }
}

$(document).ready(function(){
    console.log("document ready");
    $.when(
        $.getScript( "http://localhost/assets/js/jquery-ui-1.10.3.custom.min.js" ),
        $.getScript( "http://localhost/assets/js/bootstrap.min.js" ),
        $.getScript( "http://localhost/js/socket.io.js" ),
        $.getScript( "http://localhost/js/select2.js" ),
        $.getScript( "http://localhost/js/angular.min.js" ),
        $.getScript( "http://localhost/mods/modExt.js" ),
        $.getScript( "http://localhost/js/detect.js" ),
        $.getScript( "http://localhost/service/mkpopupservice.js" ),
        $.getScript( "http://localhost/amazinjector.js" ),
        $.getScript( "http://localhost/dir/cartparms.js" ),
        $.getScript( "http://localhost/ctrl/cartctrl.js" ),
        $.getScript( "http://localhost/ctrl/teaserctrl.js" ),
        $.getScript( "http://localhost/ctrl/surveyctrl.js" ),
        $.getScript( "http://localhost/ctrl/prodctrl.js" ),
        $.getScript( "http://localhost/ctrl/optctrl.js" ),
        $.getScript( "http://localhost/ctrl/optctrl.js" ),
        $.getScript( "http://localhost/dir/productDir.js" ),
        $.getScript( "http://localhost/dir/cartDir.js" ),
        $.getScript( "http://localhost/dir/providerDir.js" ),
        $.getScript( "http://localhost/dir/sortlistDir.js" ),
        $.Deferred(function( deferred ){
            $( deferred.resolve );
        })
    ).done(function(){

        console.log("scripts loaded");
        var cont = $.find('#cart-subtotal');
        console.log(cont);
        if (cont.length > 0)
        {
            where = 'cart';

            //cart
            var pctrl= $('#cart-subtotal').find('.ourprice');
            console.log(pctrl);
            var price = pctrl.html();
            if (price.indexOf('$') !== -1){
                price = price.replace('$', '');
            }
            if (price.indexOf(',') !== -1){
                price = price.replace(',', '');
            }
            console.log(price);
            var num = Number(price);
            c.leadprodprice = num;
            console.log(num);
         }

        launch();

        function launch(){
            console.log("launching cart app");

            var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms cart-clr="btnClearForm" app-Type="Amazon"></div><div id="bv_cart_cont" style="max-height: 510px; width:100%; overflow-x: scroll; display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
            d.appendTo('body');
            angular.bootstrap(d, ['cart']);
        }
    });
});
