/*
 * gridracer.js
 * 
 * Copyright 2012 Matthijs Wensveen <matthijs@forsite.dk>
 * see license.txt for licensing information
 * 
 */

function getValidMoves(player) {
	return player.moves.map(function(move) {
		var targetCell = {
			x: player.x + player.speed.x + move.x,
			y: player.y + player.speed.y + move.y
		};
		
		return targetCell;
	});
}

function movePlayer(player, track, cell, canvas, complete) {
	var transform = $(canvas).data('transform');
	if (transform == null) {
		transform = new Transform();
		$(canvas).data('transform', transform);
	}
	
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// the dx and dy in cells
	var dx = cell.x - player.x;
	var dy = cell.y - player.y;
	
	// the dx and dy in pixels
	var dx_px = dx * cell.width;
	var dy_px = dy * cell.height;
	
	
	// TODO: detect checkpoints
	
	transform.save()
	
	// Move to the center of the starting cell
	var player_x_px = player.x * cell.width + cell.width / 2;
	var player_y_px = player.y * cell.height + cell.height / 2;
	transform.translate(player_x_px, player_y_px)

	// calculate rotation
	var rotation = Math.PI - Math.atan2(dx, dy);
	transform.rotate(rotation);

	// Calculate the animation distance
	var dist = Math.sqrt(Math.pow(dx_px, 2) + Math.pow(dy_px, 2))
	
	// Detect collisions with track bounds
	var collision = false;
	var d = 0;
	while (d <= dist) {
		var top = int(0 - d - cell.height / 2);
		
		var collisionPoint = transform.getTransformedPoint(0, top);
		var pixel = getPixelValue(track.data.data, track.data.width, int(collisionPoint[0]), int(collisionPoint[1]));
		
		if (pixel != 0) {
			// Collision!
			collision = true;
			break;
		}
		
		d++;
	}

	if (collision) {
		// get coordinates of the center of the player
		var playerPoint = transform.getTransformedPoint(0, int(0 - d));
		
		player.speed = { x: 0, y: 0 };
		player.x = int(playerPoint[0] / cell.width);
		player.y = int(playerPoint[1] / cell.height);
	} else {
		player.speed = { x: dx, y: dy };
		player.x = cell.x;
		player.y = cell.y;
	}
	
	// animate over distance (from 0 to dist) in 500 ms
	transform.applyToContext(ctx);
	$({ n: 0 }).animate({ n: dist }, {
		duration: 400,
		step: function(now, fx) {
			// Clear the path (whole canvas would also do the trick, but this is a little more optimized)
			var left = 0 - cell.width / 2;
			var top = 0 - now - cell.height / 2;
			ctx.clearRect(left, cell.height / 2, cell.width, top);
			
			// draw the player at the current position
			ctx.drawImage(player1.image, left, top);

			if (collision && now >= d) {
				$(fx.elem).stop();

				transform.restore();
				transform.applyToContext(ctx);
				complete.call(this);
			}
		},
		complete: function() {
			transform.restore();
			transform.applyToContext(ctx);
			complete.call(this);
		}
	});
}

function highlightCells(canvas, color, cells, cellWidth, cellHeight) {
	// clear the canvas
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var c = 0; c < cells.length; c++) {
		var cell = cells[c];
		
		ctx.fillStyle = color;
		ctx.fillRect(cell.x * cellWidth, cell.y * cellHeight, cellWidth, cellHeight);
		
		ctx.strokeStyle = 'black';
		ctx.strokeRect(cell.x * cellWidth, cell.y * cellHeight, cellWidth, cellHeight);
	}
}

function getPixelValue(pixels, width, x, y) {
	var offset = (y * width + x) * 4;
	return  pixels[offset]     << 24 |
			pixels[offset + 1] << 16 |
			pixels[offset + 2] <<  8 |
			pixels[offset + 3];
}

function int(x) {
	// bitwise OR with 0 to get the int part
	return x | 0;
}
