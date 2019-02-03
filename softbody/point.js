

class Point {
	/*
		Just a 2D point, (x,y)
	*/
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
	copy() {
		return new Point(this.x, this.y)
	}
	add(other) {	// Returns vector of this plus other
		return new Point(
			this.x + other.x,
			this.y + other.y
		);
	}
	sub(other) {	// Returns vector of this minus other (vector from other to this)
		return new Point(
			this.x - other.x,
			this.y - other.y
		);
	}
	set(x,y) {
		this.x = x;
		this.y = y;
	}
	size() {	// Returns size of point (dist from 0,0)
		return Math.hypot(this.x, this.y);
	}
	distFrom(other) {	// Returns distance of point from another point
		return Math.hypot(this.x-other.x, this.y-other.y);
	}
	dot(other) {
		return this.x*other.x + this.y*other.y;
	}
	angleFrom(other) {	// Returns the acute angle between itself and another point (vector)
		// Using a mathematically simplified version of... angle = Math.atan(Math.abs((m1 - m2) / (1 + m1*m2)));
		// Angles are return positive/negative to allow for operations that take into account relative direction of vectors
		return Math.atan(((this.y*other.x - this.x*other.y)/(this.x*other.x + this.y*other.y)));
	}
	normal() {
		return new Point(-this.y, this.x);
	}

	renderPos() {	// Returns position of point if it were to be rendered in simulation rectangle
		return new Point(
			this.renderRect.x + this.renderRect.w * (this.x-this.simRect.x)/this.simRect.w,
			this.renderRect.y + this.renderRect.h * (1 - (this.y-this.simRect.y)/this.simRect.h)
		);
	}

	mousePos() {	// Returns a point that represents mouse pos on screen
		return new Point(
			this.simRect.x + this.simRect.w * (main.mousePos.x - this.renderRect.x) / this.renderRect.w, 
			this.simRect.y + this.simRect.h * (this.renderRect.h - main.mousePos.y + this.renderRect.y) / this.renderRect.h
		);
	}
}
