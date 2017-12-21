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

	Site.our_team_gallery = new Caracal.Gallery.Slider(4, false);
	Site.our_team_gallery
		.images.set_container('div#our_team_images_holder')
		.images.set_center(true)
		.images.set_spacing(40)
		.images.add('div#our_team_images_holder figure')
		.controls.attach_next('div#our_team_images_holder a.next')
		.controls.attach_previous('div#our_team_images_holder a.previous')
		// .controls.set_auto(4000)
		.controls.set_pause_on_hover(true)
		.images.update();

	if(Site.is_mobile()) {
		Site.our_team_gallery.images.set_visible_count(1);

		// add event listener for all details links
		Site.details_links = document.querySelectorAll('a.details');
		for(var i=0; i < Site.details_links.length; i++) {
			Site.details_links[i].addEventListener('click', Site.handle_toggling);
		}
	}
};


// connect document `load` event with handler function
$(Site.on_load);
