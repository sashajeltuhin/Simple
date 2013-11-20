jQuery(document).ready(function() {	

	
	// Place Holder Forms
    $('input, textarea').placeholder();
	
	// Button Animation
	$('a.op').hover(function() {
		$(this).css({ opacity: 0.8 });
	}, function() {
		$(this).css({ opacity: 1.0 });
	});
	
	// Same Height
	equalHeight($(".sameHeight1"));	
	equalHeight($(".sameHeight2"));	
	equalHeight($(".sameHeight3"));	
	equalHeight($(".sameHeight4"));	
	equalHeight($(".sameHeight5"));	
	equalHeight($(".sameHeight6"));	
	equalHeight($(".sameHeight7"));	
	
	// Scroller
	$("#scroller").simplyScroll({
		autoMode: 'loop',
		speed: 2
	});	

	// Datepicker
	$( ".datepicker" ).datepicker({
		showOn: "button",
		buttonImage: "assets/img/ico-calendar1.png",
		buttonImageOnly: true
	});
	
	// Collapse
	$('.collapse').on('show', function(){
		$(this).parent().find("a").removeClass("").addClass("active");
	}).on('hide', function(){
		$(this).parent().find("a.active").removeClass("active").addClass("");
	});	
	$('.collapse').on('show', function(){
		$(this).parent().find("span").removeClass("").addClass("active");
	}).on('hide', function(){
		$(this).parent().find("span.active").removeClass("active").addClass("");
	});
	
	// Tabs
	$('#tabs1 a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
    })
	
	// popover demo
    $("[data-toggle=popover]")
      .popover()
	
	$('.btn-group.v1 button').click(function (e) {      
        $('.btn-group.v1 button.active').not($(this).closest('button')).removeClass('active');
	});
	$('.btn-group.v2 button').click(function (e) {      
        $('.btn-group.v2 button.active').not($(this).closest('button')).removeClass('active');
	});
	$('.btn-group.v3 button').click(function (e) {      
        $('.btn-group.v3 button.active').not($(this).closest('button')).removeClass('active');
	});
	$('.btn-group.v4 button').click(function (e) {      
        $('.btn-group.v4 button.active').not($(this).closest('button')).removeClass('active');
	});
	$('.btn-group.v5 button').click(function (e) {      
        $('.btn-group.v5 button.active').not($(this).closest('button')).removeClass('active');
	});
	$('.btn-group.v6 button').click(function (e) {      
        $('.btn-group.v6 button.active').not($(this).closest('button')).removeClass('active');
	});
	$('.btn-group.v7 button').click(function (e) {      
        $('.btn-group.v7 button.active').not($(this).closest('button')).removeClass('active');
	});
	
});

