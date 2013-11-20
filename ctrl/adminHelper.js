$(document).ready(function(){

    $('body').find('.fld').hover(function(){
        $(this).addClass('highlite');
        //$(this).animate({ 'zoom': 1.2 }, 400);
    },function(){
        $(this).removeClass('highlite');
        //$(this).animate({ 'zoom': 1 }, 400);
    }).click(function(){
        }).each(function(){
            var fldname = $(this).attr('data');
            var fldval = that.options.prodData[fldname];
            var typectrl = $.isArray(fldval) ? 'textarea' : 'text';
            $(this).editable({
                type: typectrl,
                title: 'Change ' + fldname,
                value: prod[fldname],
                success:function(response, newval){
                    prod[fldname] = newval;
                }
            });
        });


});
