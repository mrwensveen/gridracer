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
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// the dx and dy in cells
	var dx = cell.x - player1.x;
	var dy = cell.y - player1.y;
	
	// the dx and dy in pixels
	var dx_px = dx * cell.width;
	var dy_px = dy * cell.height;
	
	// Detect collisions (track bounds)
	
	// Collision detection only takes the center point of the player in accountance,
	// because it's easier. Otherwise a bounding box would need to be used and their
	// coordinates would have to be calculated by using matrix calculations
	// (which I don't want to do right now :) )


	var step_x, step_y;
	if (Math.abs(dx_px) > Math.abs(dy_px)) {
		step_x = dx_px / Math.abs(dx_px);
		step_y = dy_px / Math.abs(dx_px);
	} else {
		step_x = dx_px / Math.abs(dy_px);
		step_y = dy_px / Math.abs(dy_px);
	}
	
	// Center coordinates of player in pixels
	var player_x_px = player.x * cell.width + cell.width / 2;
	var player_y_px = player.y * cell.height + cell.height / 2;
	
	var collision = false;
	
	var end_x_px, x_px = 0;
	var end_y_px, y_px = 0;
	while (Math.abs(x_px) <= Math.abs(dx_px) && Math.abs(y_px) <= Math.abs(dy_px)) {
		// bitwise OR with 0 to get the int part
		end_x_px = (player_x_px + x_px) | 0;
		end_y_px = (player_y_px + y_px) | 0;
		
		var pixel = getPixelValue(track.data.data, track.data.width, end_x_px, end_y_px);
		console.log(end_x_px + ',' + end_y_px + ': ' + pixel);
		
		if (pixel != 0) {
			collision = true;
			break;
		}
		
		x_px += step_x;
		y_px += step_y;
	}
	
	// Set the new player speed and coordinates
	if (collision) {
		// collision, STOP!
		player.speed = { x: 0, y: 0 };
		player.x = (end_x_px / cell.width) | 0;
		player.y = (end_y_px / cell.height) | 0;
	} else {
		player.speed = {
			x: dx,
			y: dy
		};
		player.x = cell.x;
		player.y = cell.y;
	}
	
	// TODO: detect checkpoints
	
	// calculate rotation
	var rotation = Math.PI - Math.atan2(dx, dy);
	
	ctx.save()
	
	// Move to the center of the starting cell and rotate
	ctx.translate(player_x_px, player_y_px)
	ctx.rotate(rotation);
	
	// Calculate the animation distance
	var dist = Math.sqrt(Math.pow(dx_px, 2) + Math.pow(dy_px, 2))
	// Calculate the real distance
	var dist_real = Math.sqrt(Math.pow(end_x_px - player_x_px, 2) + Math.pow(end_y_px - player_y_px, 2))
	
	// animate over distance (from 0 to dist) in 500 ms
	$({ n: 0 }).animate({ n: dist}, {
		duration: 400,
		step: function(now, fx) {
			// Clear the path (whole canvas would also do the trick, but this is a little more optimized)
			ctx.clearRect(0 - cell.width / 2, cell.height / 2, cell.width, 0 - (now + cell.height));
			
			ctx.drawImage(player1.image, 0 - cell.width / 2, 0 - now - cell.height / 2);
			
			if (now >= dist_real) {
				$(fx.elem).stop();
				ctx.restore();
				complete.call(this);
			}
		},
		complete: function() {
			ctx.restore();
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
