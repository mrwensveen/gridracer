/*
 * jQuery.grid.js
 * see license.txt for (c) and licensing information
 */

function getMousePos(canvas, evt){
	// get canvas position
	var obj = canvas;
	var top = 0;
	var left = 0;
	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}
 
	// return relative mouse position
	var mouseX = evt.clientX - left + window.pageXOffset;
	var mouseY = evt.clientY - top + window.pageYOffset;
	return {
		x: mouseX,
		y: mouseY
	};
}

(function($) {
	var methods = {
		init : function(gridWidth, gridHeight, options) {
			return this.each(function() {
				var $this = $(this);
				
				var settings = $.extend({
					'width' : $this.width(),
					'height' : $this.height(),
					'background-color-even' : '#DDD',
					'background-color-odd' : '#AAA',
					'stroke' : false,
					'stroke-color' : '#000',
					'layers' : 2,
					// Events
					'created' : null,
					'click' : null,
					'mouseenter' : null,
					'mouseleave' : null
				}, options);
				
				// Create a canvas for each layer
				$this.html('');
				for(var l = 0; l < settings.layers; l++) {
					$this.append('<canvas class="layer_' + l + '" width="' + settings.width + '" height="' + settings.height + '" style="position: absolute;"></canvas>');
				}
				
				var layers = $('canvas', $this);

				// Calculate the width and height of a single cell
				var cellWidth = settings.width / gridWidth;
				var cellHeight = settings.height / gridHeight;

				// Draw the background layer
				if (layers.length > 0 && layers[0].getContext) {
					
					// Draw grid
					var ctx = layers[0].getContext("2d");
					
					for (var y = 0; y < gridHeight; y++) {
						for (var x = 0; x < gridWidth; x++) {
							var bgColor = ((x + y) % 2 == 0) ? settings['background-color-even'] : settings['background-color-odd'];
							
							ctx.fillStyle = bgColor;
							ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
							
							if (settings['stroke']) {
								ctx.strokeStyle = settings['stroke-color'];
								ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
							}
						}
					}
				}
				
				function createGridEvent(evt) {
					var pos = getMousePos(evt.target, evt);
					var gridEvent = {
						'mouse' : pos,
						'event' : evt,
						'cell' : {
							'x' : Math.floor(pos.x / cellWidth),
							'y' : Math.floor(pos.y / cellHeight),
							'width' : cellWidth,
							'height' : cellHeight
						},
						'layers' : layers
					};

					return gridEvent;
				}
				
				// Bind click and hover events
				if (settings.click != null) {
					$this.bind('click', function(evt) {
						var gridEvent = createGridEvent(evt);
						settings.click.call(this, gridEvent);
					});
				}
					
				var currentX = -1, currentY = -1;
				
				if (settings.mouseenter != null || settings.mouseleave != null) {
					$this.bind('mousemove', function(evt) {
						var gridEvent = createGridEvent(evt);
						
						if (currentX != gridEvent.cell.x || currentY != gridEvent.cell.y) {
							if (settings.mouseleave != null && currentX != -1 && currentY != -1) {
								
								var leaveEvent = $.extend(true, {}, gridEvent);
								leaveEvent.cell.x = currentX;
								leaveEvent.cell.y = currentY;
								
								settings.mouseleave.call(this, leaveEvent);
							}
							
							if (settings.mouseenter != null) {
								settings.mouseenter.call(this, gridEvent);
							}
							
							currentX = gridEvent.cell.x;
							currentY = gridEvent.cell.y;
						}
					});
				}
				
				// Trigger created event
				if (settings.created != null) {
					var event = {
						'cell' : {
							'x' : 0,
							'y' : 0,
							'width' : cellWidth,
							'height' : cellHeight
						},
						'layers' : layers
					};
					settings.created.call(this, event);
				}
			});
		},
		destroy : function() {
			// TODO
		},
	};
	
	$.fn.grid = function(method) {

		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'number' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.grid');
		}
	};

})(jQuery);

