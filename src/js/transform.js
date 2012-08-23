/*
 * Based on work by Simon Sarris: https://github.com/simonsarris/Canvas-tutorials
 * Modified to work with J. Coglan's Sylvester library (see JS header below)
 * and to mimic Canvas's transformation methods
 * Also based on work by Matthew Crumly: http://stackoverflow.com/questions/849785/get-un-translated-un-rotated-x-y-coordinate-of-a-point-from-a-javascript-canv
 */

//---------------------------------
// Last updated November 2011
// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Simple class for keeping track of the current transformation matrix

// For instance:
//    var t = new Transform();
//    t.rotate(5);
//    var m = t.m;
//    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

// Is equivalent to:
//    ctx.rotate(5);

// But now you can retrieve it :)

// Remember that this does not account for any CSS transforms applied to the canvas
//---------------------------------

function Transform() {
	this.reset();
}

Transform.prototype.reset = function() {
	this.m = Matrix.I(3);
};

Transform.prototype.save = function() {
	if (!this.stack) {
		this.stack = [];
	}
	this.stack.push(this.m.dup());
};

Transform.prototype.restore = function() {
	if (this.stack && this.stack.length > 0) {
		this.m = this.stack.pop();
	}
};

Transform.prototype.rotate = function(angle) {
	var sin = Math.sin(angle);
	var cos = Math.cos(angle);
	this.m = this.m.multiply($M([
		[cos, -sin, 0],
		[sin,  cos, 0],
		[   0,   0, 1]
	]));
};

Transform.prototype.translate = function(x, y) {
	this.m = this.m.multiply($M([
		[1, 0, x],
		[0, 1, y],
		[0, 0, 1]
	]));
};

Transform.prototype.scale = function(sx, sy) {
	this.m = this.m.multiply($M([
		[x, 0, 0],
		[0, y, 0],
		[0, 0, 1]
	]));
};

Transform.prototype.transform = function(m11, m12, m21, m22, dx, dy) {
	this.m = this.m.multiply($M([
		[m11, m21, dx],
		[m12, m22, dy],
		[  0,   0,  1]
	]));
};

Transform.prototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
	this.m = $M([
		[m11, m21, dx],
		[m12, m22, dy],
		[  0,   0,  1]
	]);
};

Transform.prototype.applyToContext = function(ctx) {
	ctx.setTransform(this.m.e(1,1), this.m.e(2,1), this.m.e(1,2), this.m.e(2,2), this.m.e(1,3), this.m.e(2,3));
};

Transform.prototype.getTransformedPoint = function(x, y) {
	var point = this.m.multiply($V([x, y, 1]));
	return [point.e(1), point.e(2)];
};
