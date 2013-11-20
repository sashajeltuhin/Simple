var c = {};
var reguser = null;
function getPerson(){
        if (reguser !== null){
            return reguser;
        }
        c.address1 = $('#bv_address1').val();
        c.appt = $('#bv_appt').val();
        c.zip = $('#bv_zip').val();
        c.moveDate = $('#bv_moveDate').val();
        c.state = $('#bv_state').val();
        c.city = $('#bv_city').val();

        console.log(c);
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
                            '<div class="col-gs-5 col-12" ><input type="text" id="bv_address1" class="form-control" placeholder="Street Address"></div>' +
                                '<div class="col-gs-3 col-12"><input type="text" id="bv_appt" class="form-control" placeholder="Apt #"></div>' +
            '<div class="clearer">&nbsp;</div>'+
                                    '<div class="col-gs-4 col-12"><input type="text" id="bv_zip" class="form-control" placeholder="ZIP Code"></div>' +
                                        '<div class="col-gs-5 col-12">' +
                                        '<input type="text" id="bv_moveDate" class="form-control datepicker" placeholder="Move date"></div>' +
            '<div class="clearer">&nbsp;</div>' +
                                            '<div class="col-gs-2 text-center"><div style="display:block; padding-top:10px;"><strong>OR</strong></div></div>' +
            '<div class="clearer">&nbsp;</div>' +
                                            '<div class="col-gs-5  col-12"><select class="form-control">' +
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

    var m = $(getModal());
    m.appendTo($('body'));
    console.log($('.avia-button'));
    $('.avia-button').attr('href', '#myModal1');
    $('.avia-button').attr('data-toggle', 'modal');
    $('#bv_start_flow').click(function(){

        launch();
    });

    function launch(){
        console.log("launching cart app");
        var cont = $('.entry-content');
        cont.children().remove();

        var zip = reguser !== null ? reguser.zip :  $('#bv_zip').val();
        console.log(zip);
        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms app-extension="1" cart-clr="btnClearForm" app-Type="OMove" cart_zipval="' + zip + '"></div><div id="bv_cart_cont" class="container" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.insertAfter(cont);
        angular.bootstrap(d, ['cart']);

//        d.width(w);
//        console.log(w);
    }


});
