var c = {};
function getPerson(){
        c.fname = $('#Text23').val();
        c.lname = $('Text8').val();
        c.email = $('#Text3').val();
        c.zip = $('#BillingPostalCodeSpan').html();
        c.ssn = $('#Text4').val() +  $('#Text5').val() +  $('#Text6').val();
        c.state = $('#Hidden158').val();
        c.city = $('#Hidden148').val();
        console.log(c);
        c.relname = $('#txt_rel_name').val();
        return c;
}
$(document).ready(function(){
        var cont = $('#OrderSteps');
        console.log(c);
        $('#Image28').replaceWith($('<img id="bv_etx_srch" src="/images/storefront50/navigation/Submit-Order.jpg" style="cursor: pointer"> '));


        console.log("launching cart app");
        var zip = $('#BillingPostalCodeSpan').html();
        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms slide-cont="#OrderSteps" cart-srch="#bv_etx_srch" cart-srchlbl="Order Now" app-extension="1" ex-cart="#ProgressBarCheckout" cart-clr="btnClearForm" app-Type="WF" cart_zipval="' + zip + '"></div><div id="bv_cart_cont" class="container appBody" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/web.html' + "'" + '"></div></div>');
        d.insertAfter(cont);
        angular.bootstrap(d, ['cart']);
        var w = $(".wf20_header_endzone").width();
        d.width(w);
        d.css({'margin': 'auto'});
        console.log(w);


});
