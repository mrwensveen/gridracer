/*
 * Based on work by Simon Sarris: https://github.com/simonsarris/Canvas-tutorials
 * Modified to work with J. Coglan's Sylvester library (see JS header below)
 * and to mimic Canvas's transformation methods
 * Also based on work by Matthew Crumly: http://stackoverflow.com/questions/849785/get-un-translated-un-rotated-x-y-coordinate-of-a-point-from-a-javascript-canv
 */

//---------------------------------
// Simple class for keeping track of the current transformation matrix
//
// For instance:
//    var t = new Transform();
//    t.rotate(5);
//    var m = t.m;
//    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
//
// Is equivalent to:
//    ctx.rotate(5);
//
// But now you can retrieve it :)
// Remember that this does not account for any CSS transforms applied to the canvas
//---------------------------------

/* global Matrix $M $V */

class Transform {
	constructor() {
		this.reset();
	}

	reset() {
		this.m = Matrix.I(3);
	}

	save() {
		if (!this.stack) {
			this.stack = [];
		}
		this.stack.push(this.m.dup());
	}

	restore() {
		if (this.stack && this.stack.length > 0) {
			this.m = this.stack.pop();
		}
	}

	rotate(angle) {
		var sin = Math.sin(angle);
		var cos = Math.cos(angle);
		this.m = this.m.multiply($M([
			[cos, -sin, 0],
			[sin, cos, 0],
			[0, 0, 1]
		]));
	}

	translate(x, y) {
		this.m = this.m.multiply($M([
			[1, 0, x],
			[0, 1, y],
			[0, 0, 1]
		]));
	}

	scale(x, y) {
		this.m = this.m.multiply($M([
			[x, 0, 0],
			[0, y, 0],
			[0, 0, 1]
		]));
	}

	transform(m11, m12, m21, m22, dx, dy) {
		this.m = this.m.multiply($M([
			[m11, m21, dx],
			[m12, m22, dy],
			[0, 0, 1]
		]));
	}

	setTransform(m11, m12, m21, m22, dx, dy) {
		this.m = $M([
			[m11, m21, dx],
			[m12, m22, dy],
			[0, 0, 1]
		]);
	}

	applyToContext(ctx) {
		ctx.setTransform(this.m.e(1, 1), this.m.e(2, 1), this.m.e(1, 2), this.m.e(2, 2), this.m.e(1, 3), this.m.e(2, 3));
	}

	getTransformedPoint(x, y) {
		var point = this.m.multiply($V([x, y, 1]));
		return [point.e(1), point.e(2)];
	}
}











