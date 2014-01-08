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
//    $.getScript("my_script.js", function(){
//
//        alert("Script loaded and executed.");
//        // Here you can use anything you defined in the loaded script
//    });
    console.log("document ready");
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


//    var cat = $.find('#nav-subnav');
//    console.log(cat);
//    c.leadprodcat = cat.attr('data-category');
//    console.log(c.leadprodcat);


    function getModal()
    {
        <!-- Modal -->
        return '<div class="modal fade" id="myModal1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">Enter Your Location</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<p style="margin-bottom:20px;">In order for us to deliver options that are available for your specific location, we need the address you are moving to.</p>' +

            '<div class="row">' +
            '<div class="col-xs-5"><input type="text" id="bv_address1" class="form-control" placeholder="Street Address" style="width: 100%"></div>' +
            '<div class="col-xs-3"><input type="text" id="bv_appt" class="form-control" placeholder="Apt #" style="width: 100%"></div>' +
            '<div class="col-xs-4"><input type="text" id="bv_zip" class="form-control" placeholder="ZIP Code" style="width: 100%"></div>' +
            '<div class="col-xs-5"><input type="text" id="bv_moveDate" class="form-control datepicker" placeholder="Move Date" style="width: 100%"></div>' +
            '<div class="col-xs-2 text-center"><div style="display:block; padding-top:10px;"><strong>OR</strong></div></div>' +
            '<div class="col-xs-5"><select class="form-control">' +
            '<option value="Move Timeframe" selected="">Move Timeframe</option>' +
            '<option value="Already moved">Already moved</option>' +
            '<option value="Within 2 weeks">Within 2 weeks</option>' +
            '<option value="2-4 weeks">2-4 weeks</option>' +
            '<option value="1-3 months">1-3 months</option>' +
            '<option value="4-6 months">4-6 months</option>' +
            '<option value="Beyond 6 months">Beyond 6 months</option>' +
            '</select></div>' +
            '</div>' +<!-- /row -->
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default uppercase" data-dismiss="modal">Close</button>' +
            '<button id="bv_start_flow" type="button" class="btn btn-style1 uppercase" data-dismiss="modal">Go</button>' +
            '</div>' +
            '</div>' +<!-- /.modal-content -->
            '</div>' +<!-- /.modal-dialog -->
            '</div>';<!-- /.modal -->

    }

//    var m = $(getModal());
//    m.appendTo($('body'));

    launch();


    function launch(){
        console.log("launching cart app");

        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms cart-clr="btnClearForm" app-Type="Amazon"></div><div id="bv_cart_cont" style="max-height: 510px; width:100%; overflow-x: scroll; display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.appendTo('body');
        angular.bootstrap(d, ['cart']);

//        d.width(w);
//        console.log(w);
    }
//    var sub = $.find('.checklistsubmit')[0];
//    console.log(sub);
//    $(sub).replaceWith('<a id="bv_reg_user" class="btn btn-lg btn-primary btn-block uppercase"><span>Register</span></a>');
//    $('#bv_reg_user').click(function(){
//        reguser = {};
//        reguser.zip = $('#regzipCode').val();
//        $('#bv_zip').val($('#regzipCode').val());
//        reguser.moveDate = $('#regmoveDate').val();
//        reguser.email = $('#regemailAddress').val();
//        reguser.fname = $('#regfirstName').val();
//        reguser.lname = $('#reglastName').val();
//        console.log(reguser);
//        $('#signedoutloginutility').html('<li class="first">Welcome,' + reguser.fname + '</li>');
//        $('#fancybox-close').click();
//        $('#fancybox-wrap').hide();
//        $('#fancybox-overlay').hide();
//        $('.bv_launcher').attr('href', '#');
//        $('.bv_launcher').attr('id', 'bv_start_flow');
//        $('#bv_start_flow').click(function(){
//
//            launch();
//        });
//    });

    }
});
