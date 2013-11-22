/**
 * Created with JetBrains WebStorm.
 * User: sashajeltuhin
 * Date: 5/3/13
 * Time: 1:05 PM
 * To change this template use File | Settings | File Templates.
 */


//var lst = $('.epod-zipcode-bar ul:first-child');
//var act = $('<li class="btn btn-warning">Save on bundle offers</li>').insertAfter(lst);
//act.click(function(){
//    launch($('.epod-zipcode-bar'));
//});

////.COM
//
//$(document).ready(function(){
//var parent = $('#category-cat_cart_prospect_international');
//var cont = $('<tr class="category"><td class="inactive"><div class="add"><a rel="ShoppingCart:showFlyout"><var title="category">"cat_cart_prospect_international"</var><span>High Speed Internet / Bundles</span></a></div><div id="bv_open_shop" class="btn btn-info">View</div> </td></tr>');
//cont.insertAfter(parent);
////$('#bv_open_shop').click(function(){
//    launch(cont);
////});
//
//});
//
//var launch = function(cont){
//    console.log("launching");
//    var zip = $('#userZip').html();
//    var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms ex_cart=".cart-totals-monthly" cart-srch="#bv_open_shop" app-extension="1"  cart-clr="btnClearForm" app-Type="CC" cart_zipval="' + zip + '" ex-prod="DTV 1Premier pakage" ex-price="114.99"></div><div id="bv_cart_cont" class="container appBody" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/first.html' + "'" + '"></div></div>');
//    d.insertAfter(cont);
//    angular.bootstrap(d, ['cart'])
//    var w = cont.width();
//    d.width(w);
//    console.log(w);
//}
//
//function getPerson(){
//    return {};
//}
//
var c = {};

function getPerson(){

    console.log(c);
    return c;
}

function onStep (step){

}


//OMS
$(document).ready(function(){
    var cont = $('#Form1');
    console.log(cont);
    launch(cont);
});



var launch = function(cont){
    console.log("launching");
    var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms app-extension="1" cart-srch="#btnSearch" cart-clr="btnClearForm" app-Type="DTV" cart_zipval="0" cart-zip="txtZip" ex-prod="DTV 1Premier pakage" ex-price="114.99"></div><div id="bv_cart_cont" class="container appBody" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
    d.insertAfter(cont);
    angular.bootstrap(d, ['cart'])
    var w = cont.width();
    d.width(w);
    console.log(w);
}

