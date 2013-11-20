jQuery(document).ready(function() {	
	
	// Place Holder Forms
    $('input, textarea').placeholder();
	
	// Button Animation
	$('a.op').hover(function() {
		$(this).css({ opacity: 0.8 });
	}, function() {
		$(this).css({ opacity: 1.0 });
	});
	
	// popover demo
    $("[data-toggle=popover]")
      .popover()
		
});

