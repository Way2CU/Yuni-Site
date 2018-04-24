/**
 * Main JavaScript
 * Site Name
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors:
 */

// create or use existing site scope
var Site = Site || {};

// make sure variable cache exists
Site.variable_cache = Site.variable_cache || {};


/**
 * Check if site is being displayed on mobile.
 * @return boolean
 */
Site.is_mobile = function() {
	var result = false;

	// check for cached value
	if ('mobile_version' in Site.variable_cache) {
		result = Site.variable_cache['mobile_version'];

	} else {
		// detect if site is mobile
		var elements = document.getElementsByName('viewport');

		// check all tags and find `meta`
		for (var i=0, count=elements.length; i<count; i++) {
			var tag = elements[i];

			if (tag.tagName == 'META') {
				result = true;
				break;
			}
		}

		// cache value so next time we are faster
		Site.variable_cache['mobile_version'] = result;
	}

	return result;
};

/**
 *	Handle toggling between image and image description
 *
 *	@param object event
 */
Site.handle_toggling = function(event) {
	event.preventDefault();

	if(event.target.parentNode.classList.contains('visible')
		&&
		!document.querySelector('figure.visible figcaption div').classList.contains('toggle')) {
		document.querySelector('figure.visible figcaption div').classList.add('toggle');
	} else {
		document.querySelector('figure.visible figcaption div').classList.remove('toggle');
	}
};

/**
 *	Handle visibility toggling on main menu
 *
 *	@param object event
 */
Site.handle_menu_toggling = function(event) {
	event.preventDefault();
	var header_menu = document.querySelector('div.menu > nav');
	header_menu.classList.toggle('input-focused');
};

/**
 * Function called when document and images have been completely loaded.
 */
Site.on_load = function() {

	//  if home page, crate PageControl object for news feeds
	if (window.location.pathname == '/') {

		// controls for moving through news feeds
		Site.news_controls = new PageControl('div#news', 'a.news');
		Site.news_controls
			.attachNextControl($('a.next'))
			.attachPreviousControl($('a.previous'))
			.setWrapAround(true)
			.setPauseOnHover(true)
			.setInterval(3000);
	}

	if(!Site.is_mobile()) {
		Site.our_team_gallery = new Caracal.Gallery.Slider(4, false);
		Site.our_team_gallery
			.images.set_container('div#our_team_images_holder')
			.images.set_center(true)
			.images.set_spacing(40)
			.images.add('div#our_team_images_holder figure')
			.controls.attach_next('div#our_team_images_holder a.next')
			.controls.attach_previous('div#our_team_images_holder a.previous')
			.controls.set_pause_on_hover(true)
			.images.update();

		// handle navigation visibility dependable on focus and blur events on search input
		var search_input = document.querySelector('div.menu form input');
		var search_submit_button = document.querySelector('div.menu form button[type=submit]');
		var menu_button = document.querySelector('#menu_button');
		var contact_link = document.querySelector('a.contact');

		search_input.addEventListener('focus', Site.handle_menu_toggling);
		search_input.addEventListener('blur', Site.handle_menu_toggling);
		search_submit_button.addEventListener('focus', Site.handle_menu_toggling);
		search_submit_button.addEventListener('blur', Site.handle_menu_toggling);

		// prevent menu from closing when contact link is focused
		contact_link.addEventListener('focus', Site.handle_menu_toggling);
		contact_link.addEventListener('blur', Site.handle_menu_toggling);
	}

	// create expanding menu
	var menu_items = document.querySelectorAll('div.menu > nav > a');
	for(var i=0, count=menu_items.length; i<count; i++) {
		if (menu_items[i].classList.contains('category')) {
			menu_items[i].addEventListener('click', function(event) {
				event.preventDefault();
				event.currentTarget.nextSibling.classList.toggle('active');
			});
			menu_items[i].addEventListener('keydown', function(event) {
				if(event.keyCode === 13) {
					event.preventDefault();
					event.currentTarget.nextSibling.classList.toggle('active');
				}
			});

			// prevent menu form closing when top level links have focus
			menu_items[i].addEventListener('focus', Site.handle_menu_toggling);
			menu_items[i].addEventListener('blur', Site.handle_menu_toggling);
		}
	}

	var second_level_menu = document.querySelectorAll('div.menu > nav > nav > a');
	for(var i=0, count=second_level_menu.length; i < count; i++) {
		second_level_menu[i].addEventListener('focus', Site.handle_menu_toggling);
		second_level_menu[i].addEventListener('blur', Site.handle_menu_toggling);
	}
};


// connect document `load` event with handler function
$(Site.on_load);
