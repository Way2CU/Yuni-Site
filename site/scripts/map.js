/**
 * Map JavaScript
 * Yuni
 *
 * Copyright (c) 2017. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Site = Site || new Object();


Site.Map = function() {
	var self = this;

	self.map = null;
	self.area = null;
	self.worker = null;
	self.delay_timer = null;
	self.matches = null;
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
		}

		// create area indicator
		self.area = document.createElement('span');
		self.area.classList.add('area');
		self.map.insertBefore(self.area, self.map.firstChild);

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
		}

		// configure worker
		self.worker.postMessage([self.area.offsetWidth / 2, point_data]);
	};

	/**
	 * Handle mouse entering the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_enter = function(event) {
		self.area.classList.add('active');
	};

	/**
	 * Handle mouse leaving the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_leave = function(event) {
		self.area.classList.remove('active');
	};

	/**
	 * Handle moving mouse around the map.
	 *
	 * @param object event
	 */
	self.handler.map_mouse_move = function(event) {
		// calculate relative position of the pointer
		var pos_x = event.clientX - self.map.offsetLeft;
		var pos_y = event.clientY - self.map.offsetTop;

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
		if (self.delay_timer != null)
			clearTimeout(self.delay_timer);
		self.matches = event.data;
		// self.delay_timer = setTimeout(self.handler.update_timer, 50);
		self.handler.update_timer();
	};

	/**
	 * Handle delayed updates to map points.
	 */
	self.handler.update_timer = function() {
		// reset timer so worker handler doesn't get confused
		self.delay_timer = null;

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
