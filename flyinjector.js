var c = {};

function onStep (step){
//    if (step !== undefined){
//        var flyheader = $('#ctl00_partnerHeader_pageHeader_pnlContent');
//        var form = $('#aspnetForm');
//
//        if (step.order == 1){
//            console.log('inserting BV');
//
//            form.hide();
//            $('#bv_cart_cont').insertAfter(flyheader);
//
//        }
//    }
}

function getPerson(){

        return c;
}
$(document).ready(function(){
        var cont = $('#aCartLink')
        console.log(cont);
        if (cont.length > 0){
            cont.replaceWith($('<img id="bv_etx_srch" src="/images/storefront50/navigation/Submit-Order.jpg" style="cursor: pointer;width: 147px;height: 33px">'));
            var banner = $('<div id="bv_banner" class="specialoffer70_offers_add-a-line_button" style="display: block;">Birdgevine banner goes here</div>');
            banner.insertAfter($('#ctl00_main_ucAddALineButton_pnlAddALineButton'));
            banner.click(function(){
                launch();
            });

            $('#bv_etx_srch').click(function(){
                launch();
            });
        }

        function launch(){
            c.zip = $('input[name="ctl00$modalWindows$ucChangeZipModal$modal__control_specialoffer_changezipmodal$txtZip"]').val();
            console.log("launching cart app");
            console.log("zip: " + c.zip);
            var flyheader = $('#ctl00_partnerHeader_pageHeader_pnlContent');
            var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms app-extension="1" cart-clr="btnClearForm" app-Type="Simplexity"></div><div id="bv_cart_cont" style="position: relative;margin: 0 auto 0 auto;width: 976px;padding: 0;height: auto;display: block;z-index: 3;text-align: left;top: 10px; display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
            d.insertAfter(flyheader);
            angular.bootstrap(d, ['cart']);
            var form = $('#aspnetForm');
            form.hide();
        }

});
