/**
 * Map Worker JavaScript
 * Yuni
 *
 * This worker is used to calculate and find locations within specified
 * area in parallel so that user interface remains functional during update.
 *
 * Copyright (c) 2018. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var radius = 0;
var points = new Array();

/**
 * Configure worker and change message handler so that
 * subsequent messages are treated as point processing
 * events.
 *
 * @param object event
 */
function configure_worker(event) {
	// store configuration data
	radius = event.data[0];
	points = event.data[1];

	// reconfigure message handler
	onmessage = get_points_in_area;
}

/**
 * Find and return list of all points in previously configured area.
 *
 * @param object event
 */
function get_points_in_area(event) {
	var result = new Array();
	var mouse_x = event.data[0];
	var mouse_y = event.data[1];

	// find all points in area
	for (var i=0, count=points.length; i<count; i++) {
		var point = points[i];
		var pos_x = point[0];
		var pos_y = point[1];

		// check if point is horizontally in area
		var delta_x = Math.abs(pos_x - mouse_x);
		if (delta_x > radius)
			continue;

		// check if point is vertically in area
		var delta_y = Math.abs(pos_y - mouse_y);
		if (delta_y > radius)
			continue;

		// final check if point is within area using Pythagoras theorem
		if (delta_x + delta_y <= radius || (delta_x ^ 2) + (delta_y ^ 2) <= (radius ^ 2))
			result.push(i);
	}

	postMessage(result);
}

// configure worker initially
onmessage = configure_worker;
