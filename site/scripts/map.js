/**
 * Map JavaScript
 * Yuni
 *
 * Copyright (c) 2018. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Site = Site || new Object();


Site.Map = function() {
	var self = this;

	self.map = null;
	self.popup = null;
	self.area = null;
	self.worker = null;
	self.matches = null;
	self.fixed = false;
	self.points = new Array();
	self.handler = new Object();

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// create worker
		self.worker = new Worker('site/scripts/map_worker.js');
		self.worker.addEventListener('message', self.handler.worker_message);

		// find map image and connect events
		self.map = document.querySelector('figure#map');
		with (self.map) {
			addEventListener('mouseenter', self.handler.map_mouse_enter);
			addEventListener('mouseleave', self.handler.map_mouse_leave);
			addEventListener('mousemove', self.handler.map_mouse_move);
			addEventListener('click', self.handler.map_mouse_click);
		}

		// create area indicator
		self.area = document.createElement('span');
		self.area.classList.add('area');
		self.map.insertBefore(self.area, self.map.firstChild);

		// create user interface for details list
		self.popup = document.createElement('div');
		self.popup.id = 'map-details';
		self.map.parentNode.insertBefore(self.popup, self.map.nextNode);

		// prepare points array
		var points = self.map.querySelectorAll('figcaption a');
		var point_data = new Array();
		for (var i=0, count=points.length; i<count; i++) {
			var point = points[i];
			var raw = point.dataset.position.split(' ');

			// prepare data for worker
			var data = [parseInt(raw[0]), parseInt(raw[1])];
			point_data.push(data);

			// position the element
			point.style.left = data[0] + 'px';
			point.style.top = data[1] + 'px';

			// store point based on it's vertical coordinate
			self.points.push(point);

			// attach event listeners
			point.addEventListener('click', self.handler.point_click);
		}

		// configure worker
		self.worker.postMessage([self.area.offsetWidth / 2, point_data]);
	};

	/**
	 * Show detailed location information.
	 */
	self.show_details = function() {
		// remove existing nodes
		while (self.popup.firstChild)
			self.popup.removeChild(self.popup.firstChild);

		// update list content
		for (var i=0, count=self.matches.length; i<count; i++) {
			// duplicate matched point
			var point = self.points[self.matches[i]];
			var menu_item = point.cloneNode(true);

			// add it to the list
			self.popup.append(menu_item);
		}

		// update popup position
		var area_x = self.map.offsetLeft + self.area.offsetLeft;
		var area_y = self.map.offsetTop + self.area.offsetTop;
		var pos_x = area_x - self.popup.offsetWidth - (self.area.offsetWidth / 2) - 10;
		var pos_y = area_y - (self.popup.offsetHeight / 2);

		self.popup.style.left = pos_x.toString() + 'px';
		self.popup.style.top = pos_y.toString() + 'px';

		// show popup
		self.popup.classList.add('visible');

		// set flag
		self.fixed = true;
	};

	self.hide_details = function(params) {
		// hide popup
		self.popup.classList.remove('visible');

		// unset flag
		self.fixed = false;
	};

	/**
	 * Handle clicking on point.
	 */
	self.handler.point_click = function(event) {
		event.preventDefault();
	};

	/**
	 * Handle mouse entering the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_enter = function(event) {
		if (self.fixed)
			return;

		self.area.classList.add('active');
	};

	/**
	 * Handle mouse leaving the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_leave = function(event) {
		if (self.fixed)
			return;

		self.area.classList.remove('active');
	};

	/**
	 * Handle clicking on the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_click = function(event) {
		if (!event.ctrlKey) {
			if (!self.fixed) {
				// ensure we don't fix area for empty match list
				if (self.matches != null && self.matches.length > 0)
					self.show_details();
			} else {
				self.hide_details();
			}

		} else {
			// calculate relative position of the pointer
			var pos_x = event.clientX - self.map.offsetLeft;
			var pos_y = event.clientY - self.map.offsetTop + window.scrollY;

			// show message with clicked coordinates
			alert('Your `text_id` is: ' + pos_x + ' ' + pos_y);
		}
	};

	/**
	 * Handle moving mouse around the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_move = function(event) {
		if (self.fixed)
			return;

		// calculate relative position of the pointer
		var pos_x = event.clientX - self.map.offsetLeft;
		var pos_y = event.clientY - self.map.offsetTop + window.scrollY;

		// update area indicator position
		with (self.area.style) {
			left = pos_x + 'px';
			top = pos_y + 'px';
		}

		// post coordinates to worker for processing
		self.worker.postMessage([pos_x, pos_y]);
	};

	/**
	 * Handle message containing matched points on map and schedule them
	 * for delayed update.
	 *
	 * @param object event
	 */
	self.handler.worker_message = function(event) {
		self.matches = event.data;
		self.handler.process_update();
	};

	/**
	 * Handle delayed updates to map points.
	 */
	self.handler.process_update = function() {
		// update classes for all points according to last match
		for (var i=0, count=self.points.length; i<count; i++)
			self.points[i].classList.remove('visible');

		for (var i=0, count=self.matches.length; i<count; i++)
			self.points[self.matches[i]].classList.add('visible');
	};

	// finalize object
	self._init();
}

window.addEventListener('load', function() {
	new Site.Map();
});
