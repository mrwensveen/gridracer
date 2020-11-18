/*
 * gridracer.js
 *
 * Copyright 2012 Matthijs Wensveen <matthijs@forsite.dk>
 * see license.txt for licensing information
 *
 */

function initializeTrack(track) {
	var grid = $('#grid').grid(track.width, track.height, {
		'width' : track.image.width,
		'height' : track.image.height,
		'background-color-even' : 'white',
		'background-color-odd' : 'white',
		'stroke' : true,
		'stroke-color' : '#42bbed',
		'layers' : 4, // grid (obsolete?), track, targets (valid moves), player
		'created' : function(evt) {
			var ctx = evt.layers[3].getContext('2d');
			ctx.drawImage(player1.image, player1.position.x * evt.cell.width, player1.position.y * evt.cell.height);

			// show track
			//$(evt.layers[1]).css('opacity', 0.8);
			var trackCtx = evt.layers[1].getContext('2d');
			trackCtx.drawImage(track.image, 0, 0);

			trackCtx.save();
			trackCtx.strokeStyle = 'blue';
			track.checkpoints.forEach(checkpoint => {
				trackCtx.beginPath();
				trackCtx.moveTo(checkpoint.from.x, checkpoint.from.y);
				trackCtx.lineTo(checkpoint.to.x, checkpoint.to.y);
				trackCtx.stroke();
			});
			trackCtx.restore();

			// show initial moves
			$(evt.layers[2]).css('opacity', 0.3);
			highlightCells(evt.layers[2], player1.color, getValidMoves(player1), evt.cell.width, evt.cell.height);
		},
		'click' : function(evt) {
			console.log('grid click', evt);

			var validMoves = getValidMoves(player1);
			if (!validMoves.some(function(move) { return move.x == evt.cell.x && move.y == evt.cell.y; })) {
				return;
			}

			var canvas = evt.layers[3];

			movePlayer(player1, track, evt.cell, evt.layers);
		},
		'mouseenter' : null /*function(evt) {
			var ctx = evt.layers[3].getContext('2d');
			ctx.fillStyle = 'blue';
			ctx.fillRect(evt.cell.width * evt.cell.x, evt.cell.height * evt.cell.y, evt.cell.width, evt.cell.height);
		}*/,
		'mouseleave' : null /*function(evt) {
			var ctx = evt.layers[3].getContext('2d');
			ctx.clearRect(evt.cell.width * evt.cell.x, evt.cell.height * evt.cell.y, evt.cell.width, evt.cell.height);
		}*/,
		'mousemove' : null /*function(evt) {
			var x = evt.mouse.x;
			var y = evt.mouse.y;
			console.log(x + ',' + y + ': ' + track.data.data[(y * track.data.width + x) * 4 + 1]);
		}*/,
		'keyup' : function(evt) {
			evt.event.stopPropagation();

			const keyName = evt.event.originalEvent.code;
			if (!keyName.startsWith('Numpad')) return;

			const validMoves = getValidMoves(player1);
			const moveIndex = [7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => 'Numpad' + n).indexOf(keyName);
			const cell = {...evt.cell, ...validMoves[moveIndex]};

			var canvas = evt.layers[3];

			movePlayer(player1, track, cell, evt.layers);
		}
	});
}

function getValidMoves(player) {
	return player.moves.map(function(move) {
		var targetCell = {
			x: player.position.x + player.speed.x + move.x,
			y: player.position.y + player.speed.y + move.y
		};

		return targetCell;
	});
}

function movePlayer(player, track, cell, layers) {
	const canvas = layers[3];

	player.moveCount++;

	var transform = $(canvas).data('transform');
	if (typeof transform == 'undefined' || transform === null) {
		transform = new Transform();
		$(canvas).data('transform', transform);
	}

	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// the dx and dy in cells
	var dx = cell.x - player.position.x;
	var dy = cell.y - player.position.y;

	// the dx and dy in pixels
	var dx_px = dx * cell.width;
	var dy_px = dy * cell.height;


	// TODO: detect checkpoints

	transform.save();

	// Move to the center of the starting cell
	var player_x_px = player.position.x * cell.width + cell.width / 2;
	var player_y_px = player.position.y * cell.height + cell.height / 2;
	transform.translate(player_x_px, player_y_px);

	// calculate rotation
	var rotation = Math.PI - Math.atan2(dx, dy);
	transform.rotate(rotation);

	// Calculate the animation distance
	var dist = Math.sqrt(Math.pow(dx_px, 2) + Math.pow(dy_px, 2));

	// Detect collisions with track bounds
	var collision = false;
	var d = 0;
	while (d <= dist) {
		var top = int(0 - d - cell.height / 2);

		var collisionPoint = transform.getTransformedPoint(0, top);
		var pixel = getPixelValue(track.data.data, track.data.width, int(collisionPoint[0]), int(collisionPoint[1]));

		if (pixel !== 0) {
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
		player.position = {
			x: int(playerPoint[0] / cell.width),
			y: int(playerPoint[1] / cell.height)
		}
	} else {
		player.speed = { x: dx, y: dy };
		player.position = { ...cell }
	}

	function complete() {
		highlightCells(layers[2], player.color, getValidMoves(player), cell.width, cell.height);
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
			ctx.drawImage(player.image, left, top);

			if (collision && now >= d) {
				$(fx.elem).stop();

				transform.restore();
				transform.applyToContext(ctx);
				complete();
			}
		},
		complete: function() {
			transform.restore();
			transform.applyToContext(ctx);
			complete();
		}
	});

	// Update stats
	const stats = $('#stats .player');
	$('.stat', stats).each(function() {
		const stat = Array.from($(this)[0].classList).find(c => c !== 'stat');
		$(this).text(player[stat]);
	})
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
