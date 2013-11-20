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
    if (step == 'credit' || step == 'cust' || step == 'order' || step == 'inst'){
        $('.sidebar').hide();
        $('#bv_tit_section').hide();
    }

    if (step == 'conf'){
        $('.sidebar').show();
        $('.box-8').width('600px');
    }
}

$(document).ready(function(){

    function getBar(){
      return  '<div class="teaser4 teaserresource">' +
            '<div class="resource-item gradient-item clearfix"><span class="resource-image">' +
                    '<img src="/content/mymove/landing/tv-phone-internet/_jcr_content/toppar/textandimage.img.image.png" alt="Triple play">' +
                    '</span><div>' +
                    '<h3><a href="http://www.mymove.com/deals/from/ATT/712561/U-Verse-Triple-Play-for-79month-TV--Internet-Elite--Voice-250"> Triple Play for $79/month: TV + Internet Elite + Voice 250</a></h3>' +
                    '<p>Get three services at a great price for two years with one-year term.' +
                    '</p><a data-toggle="modal" href="#myModal1" class="bv_launcher op"><img src="/content/mymove/_jcr_content/teaserresourcecontainer/teaser4.img.icon.png"> See More Triple Play Deals</a>'+
                    '</div></div></div>';
    }

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

    var m = $(getModal());
    m.appendTo($('body'));
    var cont = $('#signupTitle').parent();
    var bar = $(getBar());
    bar.insertAfter(cont);

    $('#bv_start_flow').click(function(){

        launch();
    });

    function launch(){
        console.log("launching cart app");
        var c = $('#teaserResourcesDiv');
        c.children().remove();
        var cont = $('<div id="bv_tit_section" class="title section"><h1>TV, Phone and Internet Deals </h1></div>').appendTo(c);
        var zip = reguser !== null ? reguser.zip :  $('#bv_zip').val();
        console.log(zip);
        var d = $('<div ng-app="cart" ng-controller="cartctrl"><div cart-parms app-extension="1" cart-clr="btnClearForm" app-Type="Imagitas" cart_zipval="' + zip + '"></div><div id="bv_cart_cont" class="container" style="display: none" ng-include src="' + "'" + 'http://localhost/templ/webmm.html' + "'" + '"></div></div>');
        d.insertAfter(cont);
        angular.bootstrap(d, ['cart']);

//        d.width(w);
//        console.log(w);
    }
    var sub = $.find('.checklistsubmit')[0];
    console.log(sub);
    $(sub).replaceWith('<a id="bv_reg_user" class="btn btn-lg btn-primary btn-block uppercase"><span>Register</span></a>');
    $('#bv_reg_user').click(function(){
        reguser = {};
        reguser.zip = $('#regzipCode').val();
        $('#bv_zip').val($('#regzipCode').val());
        reguser.moveDate = $('#regmoveDate').val();
        reguser.email = $('#regemailAddress').val();
        reguser.fname = $('#regfirstName').val();
        reguser.lname = $('#reglastName').val();
        console.log(reguser);
        $('#signedoutloginutility').html('<li class="first">Welcome,' + reguser.fname + '</li>');
        $('#fancybox-close').click();
        $('#fancybox-wrap').hide();
        $('#fancybox-overlay').hide();
        $('.bv_launcher').attr('href', '#');
        $('.bv_launcher').attr('id', 'bv_start_flow');
        $('#bv_start_flow').click(function(){

            launch();
        });
    });


});
