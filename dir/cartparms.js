angular.module('cart').directive('cartParms', function() {
    return{
        restrict: 'A',
        link: function(scope, elem, attr){
            var oldEl = $(attr.cartSrch);
            var zipEl = $('#' + attr.cartZip);
            var appType = attr.appType;
            var exProd = attr.exProd;
            var exPrice = attr.exPrice;
            var zipVal = attr.cartZipval;
            var prod = null;
            var exCart = attr.exCart !== undefined ? $(attr.exCart) : null;
            if (exProd == undefined || exPrice == undefined){
                prod =  {name: "", price: 0};
            }
            else{
                prod =  {name: exProd, price: exPrice};
            }
            if (attr.cartSrch !== undefined && oldEl.attr('id') !== 'bv_etx_srch'){
            oldEl.replaceWith("<div id='bv_etx_srch' class='btn'>Search</div>");
            }
            if (attr.cartSrchlbl !== undefined){
                $('#bv_etx_srch').html(attr.cartSrchlbl);
            }
            applyClass(oldEl);
            if (attr.cartSrch !== undefined){
            $('#bv_etx_srch').click(function(){
                var cust = getPerson();
                console.log(cust);
                var z = attr.cartZip !==undefined ? zipEl.val() : zipVal;
                if (z == undefined){
                    z = cust.zip;
                }
                if (attr.slideCont !== undefined){
                    $(attr.slideCont).slideUp();
                }
               $('#bv_cart_cont').slideDown();
                var extension = attr.appExtension != undefined;
                scope.start(z, cust, appType, extension, prod, exCart);
            });
            }
            else{
                var cust = getPerson();
                console.log(cust);
                var z = attr.cartZip !==undefined ? zipEl.val() : zipVal;
                if (z == undefined){
                    z = cust.zip;
                }
                if (attr.slideCont !== undefined){
                    $(attr.slideCont).slideUp();
                }
                $('#bv_cart_cont').slideDown();
                var extension = attr.appExtension != undefined;
                scope.start(z, cust, appType, extension, prod, exCart);
            }

            if ($('#'+ attr.cartClr) !== undefined){
            $('#'+ attr.cartClr).replaceWith("<div id='bv_etx_clr' class='btn'>Clear</div>");
            $('#bv_etx_clr').click(function(){
                $('#bv_cart_cont').slideUp(300);
                scope.clear();
            });
            }
        }

    }
        function applyClass(oldEl){
            if (oldEl.attr('class') == undefined){
                return;
            }
            var classList =oldEl.attr('class').split(/\s+/);
            $.each( classList, function(index, c){
                $('#bv_etx_srch').addClass(c)
            });
        }
}
);
