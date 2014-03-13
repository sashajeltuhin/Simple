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
            if ($('#cart-gutter').length > 0){
                $('#bv_cart_cont').insertAfter($('#cart-gutter'));
            }else{
                $('#bv_cart_cont').insertAfter($('#sc-buy-box'));
            }
            //$('#bv_cart_cont').insertAfter($('#sc-buy-box'));
        }
        else if (step.name == 'teaser' && step.app == 'AZ2')
        {
            console.log('adding step 1 AZ2');
            //var lst = $('#cartRecsButtonWrapper').find('ul');
            var lst = $('#a-carousel-viewport').find('ol');
            lst.prepend($('#bv_cart_cont')); // cart hor
        }
        else{// (step.order == 2){
            console.log('adding step 2');
//            $('#cart-standard-center').children().hide();
            console.log($('#cart-upsell'));
            if ($('#cart-upsell').length > 0){
                $('#bv_cart_cont').insertAfter($('#cart-upsell'));
            }
            else{
                $('#bv_cart_cont').insertAfter($('#sc-upsell'));
            }
            //$('#bv_cart_cont').insertAfter($('#sc-upsell'));

        }
    }
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

$(document).ready(function(){
//    $.getScript("my_script.js", function(){
//
//        alert("Script loaded and executed.");
//        // Here you can use anything you defined in the loaded script
//    });
    console.log("document ready");

    var price = getURLParameter('loan');
    var score = getURLParameter('fico');
    var ar = score.split("|");
    console.log("fico score:", ar[0]);

    var num = Number(price);
    c.zip = getURLParameter('zip');
    c.leadprodprice = num;
    c.credit_score = Number(ar[0]);
    console.log("customer init:", c);

    launch();


    function launch(){
        console.log("launching cart app");

        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms cart-clr="btnClearForm" app-Type="Bankrate"></div><div id="bv_cart_cont" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.appendTo('body');
        angular.bootstrap(d, ['cart']);
    }

});
