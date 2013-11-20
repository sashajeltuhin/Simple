var c = {};
function getPerson(){
    c.relname = $('#txt_rel_name').val();
    return c;
}
function onStep (step){
//    if (step == 'credit' || step == 'cust' || step == 'order' || step == 'inst'){
//        $('.sidebar').hide();
//        $('#bv_tit_section').hide();
//    }
//
//    if (step == 'conf'){
//        $('.sidebar').show();
//        $('.box-8').width('600px');
//    }
}

$(document).ready(function(){

    var view = 's1';
    console.log('loading injector');

    $('#btn-continue').click(function(){
        console.log('continue clicked');
        s1();
    });

    $('#btn-continue2').click(function(){
        console.log('continue2 clicked');
        c.company = $('#txt_emp_name').val();
        var cont = $('.container-content');
        console.log(c);
        launch(cont);
    });



    function s1(){
        c.moveDate = $('#txt_date').val();
        c.fname = $('#txt_fname').val();
        c.email = $('#txt_email').val();
        c.zip = $('#txt_nzip').val();
        c.ssn = $('#txt_ssn').val();
        c.state = $('#sel_nstate').val();
        c.city = $('#txt_ncity').val();
        c.address1 = $('#txt_nstreet').val();
        console.log(c);
    }

    var launch = function(cont){
        console.log("launching cart app");
        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms slide-cont=".main-content" cart-srch=".btn-finish" cart-srchlbl="Turn it on" app-extension="1" cart-clr="btnClearForm" app-Type="OMove" cart_zipval="0" cart-zip="txt_nzip"</div><div id="bv_cart_cont" class="container" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.insertAfter(cont);
        angular.bootstrap(d, ['cart'])
        var w = cont.width();
        d.width(w);
        console.log(w);
    }

});
