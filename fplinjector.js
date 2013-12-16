var where;

var c = {};
c.leadprodprice = 0;
c.state = 'Florida';

var reguser = null;
function getPerson(){
    if (reguser !== null){
        return reguser;
    }

    console.log(c);
    return c;
}


function onStep (step){
    if (step !== undefined){
        console.log('onStep');
        if (step.name == 'teaser'){
            console.log('adding step 1 DK');
            var cont = $('#dsm');
            var fstrow = $('#dsm tr').eq(2);
            var fstcell = fstrow.find('td:first');
            fstcell.replaceWith($('#bv_cart_cont'));
        }

        if (step.order == 2){
            console.log('adding step 2');
            $('#bv_cart_cont').insertAfter($('#dsm'));
            $('#dsm').find("tr:gt(0)").remove();

        }
        if (step.order == 3){
            console.log('adding step 3');

        }
    }
}

$(document).ready(function(){
//    console.log("document ready");
    var cont = $.find('#dsm');
    console.log(cont);
    if (cont.length > 0)
    {

    launch();


    function launch(){
        console.log("launching cart app");

        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms cart-clr="btnClearForm" app-Type="FPL"></div><div id="bv_cart_cont" style="width:100%; display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.appendTo('body');
        angular.bootstrap(d, ['cart']);
    }

    }
});
