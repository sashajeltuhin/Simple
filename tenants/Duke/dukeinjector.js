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
            var cont = $('#1295889253058');
            var orig = cont.find('.twoColumnFull:nth-child(2)');
            console.log(orig);
            orig.replaceWith($('#bv_cart_cont'));
        }

        if (step.order == 2){
            console.log('adding step 2');
            $('#bv_cart_cont').removeClass('twoColumnFull');
            $('#bv_cart_cont').removeClass('twoColumn');
            $('#1295889253058').hide();
            $('#bv_cart_cont').insertAfter($('#w1293730860953'));
        }
        if (step.order == 3){
            console.log('adding step 3');
            $('#ls-gen3-ls-fxr').prepend($('#bv_cart_cont'));
            $('#ls-gen3-ls-fxr').width(932);
            $('#row-2-area-1').hide();
            $('#row-2-area-2').hide();

        }
    }
}

$(document).ready(function(){
//    console.log("document ready");
    var cont = $.find('#1295889253058');
    console.log(cont);
    if (cont.length > 0)
    {
        //sidenav
        var navlist = $.find('#1296790896961 ul');
        var trigger = $('<li><a href="#">Open account</a></li>');
        trigger.click(function(){
            launch();
        });
        trigger.prependTo(navlist);





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




    function launch(){
        console.log("launching cart app");

        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms app-Type="Duke"></div><div id="bv_cart_cont" style="max-height: 500px; overflow-y: scroll; display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
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
