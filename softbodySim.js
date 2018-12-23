/*

	Two particles have a connection
	A connection is simply a preffered distance between one another
	Too far apart and they will be attracted, too close together and they will repel

	Could use  F = -(1/x + x - 2)  as the force formula
	This follows the spring formula F=-kx for large values and for small values the force increases rapidly as distance approaches zero

	Something like y=x-d is not possible because the distance between the points cannot be negative


	

	To loop through particles to repel them, a faster method that involves less looping is...
	This method requires less looping, and also allows certain values used for both particles to be used together

	for (let i=0; i<this.particles.length; i++) {
		for (let j=0; j<i; j++) {
			particle i repel particle j
			particle j repel particle i
		}
	}




	Force producer which keeps the angle between edges the same as how they started

	Someone applied the particle-spring method to create a good softbody sim
	https://www.youtube.com/watch?v=S95oZXSeKvE



	Angles are preserved with a force similar to length of springs
	The force is a set torque, and is applied to the two particles which subtend the angle




*/

class SoftbodySim {
	constructor() {

		this.renderRect = {x:40, y:80, w:800, h:500};
		this.simRect = {x:0, y:0, w:16, h:10};		// All particles are kept within this area
		//this.visibleRect = {}		// Actual rendering area for simulation

		Point.renderRect = this.renderRect;
		Point.simRect = this.simRect;


		this.particles = [
			//new Particle(new Point(3,3), 5),
			//new Particle(new Point(4,3), 5),
			//new Particle(new Point(3.5,2), 5)
		];

		this.springs = [
			//new Spring(this.particles[0], this.particles[1], 1),
			//new Spring(this.particles[1], this.particles[2], 1),
			//new Spring(this.particles[0], this.particles[2], 1)
		];

		this.boundary = new Boundary(this.particles, [1,15,1,9], 100);

	}
	render() {

		// Background rectangle
		drawRect(this.renderRect, "black", 2, "grey");

		this.boundary.render();

		for (let i=0; i<this.springs.length; i++) {
			this.springs[i].render();
		}

		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].render();
		}

		
	}
	update(dt=1/60) {

		// Have a bunch of different force producers (gravity, springs, boundaries, walls, etc)
		// Each update, the force produces are updated to apply forces onto each particle based on its position
		// For optimisation, force producers can skip certain particles that do not lie within the force producers reasonable range


		// Apply gravity force producer

		// Apply boundary force producer
		this.boundary.update();

		// Apply spring force producer
		for (let i=0; i<this.springs.length; i++) {
			this.springs[i].update();
		}

		// Apply particle force producer between each particleo
		for (let i=0; i<this.particles.length; i++) {
			for (let j=0; j<i; j++) {
				this.particles[i].repel(this.particles[j]);
				this.particles[j].repel(this.particles[i]);
			}
		}

		// Update particle velocity and position (also gravity)
		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].update(dt);
		}

	}
	spawnParticle(rect=this.renderRect) {

		// Don't spawn if not inside render rect
		if (!pointInRect(main.mouseDown, this.renderRect)) return;

		if (main.keyDown["KeyP"]) {

			this.particles.push(
				new Particle(new Point().mousePos())
			);

		} else if (main.keyDown["KeyO"]) {

			let verticeCount = 10;
			let radius = 1;
			for (var i=0; i<verticeCount; i++) {
				let angle = i/verticeCount * Math.PI * 2;
				this.particles.push(
					new Particle(new Point().mousePos().add(new Point(
						radius*Math.cos(angle), 
						radius*Math.sin(angle)
					)))
				);
			}

		} else if (main.keyDown["KeyI"]) {

			this.spawnCircle(50);

		} else if (main.keyDown["KeyU"]) {

			let p1 = new Particle(new Point().mousePos(), 3);
			let p2 = new Particle(new Point().mousePos().add(new Point(1, 0)), 3);
			let p3 = new Particle(new Point().mousePos().add(new Point(0, -1)), 3);
			//let p3 = new Particle(new Point().mousePos().add(new Point(1/1.41, 1/1.41)), 3);
			//let p2 = new Particle(new Point().mousePos().add(new Point(3, 0)), 3);
			//let p3 = new Particle(new Point().mousePos().add(new Point(0, -5)), 3);

			this.particles.push(p1);
			this.particles.push(p2);
			this.particles.push(p3);

			this.springs.push(new Spring(p1, p2, 1, 100));
			this.springs.push(new Spring(p1, p3, 1, 100));
			this.springs.push(new Spring(p2, p3, 1.41, 100));
			//this.springs.push(new Spring(p1, p2, 3));
			//this.springs.push(new Spring(p1, p3, 4));
			//this.springs.push(new Spring(p2, p3, 5));

		} else {
			this.spawnCircle(3);
		}
	}
	spawnCircle(verticeCount) {
		let sideLength = Math.sqrt(3/verticeCount);
		let radius = verticeCount*sideLength/(2*Math.PI);
		for (var i=0; i<verticeCount; i++) {
			let angle = i/verticeCount * Math.PI * 2;
			this.particles.push(
				new Particle(new Point().mousePos().add(new Point(
					radius*Math.cos(angle), 
					radius*Math.sin(angle)
				)), 1)
			);
		}

		// Connect with springs
		for (var i=0; i<verticeCount; i++) {
			let index1 = this.particles.length - verticeCount + i;
			let index2 = this.particles.length - verticeCount + (i+1)%verticeCount;
			this.springs.push(new Spring(this.particles[index1], this.particles[index2], sideLength, 100));
		}

		// Connect middle to springs
		this.particles.push(
			new Particle(new Point().mousePos(), 1)
		);
		for (var i=0; i<verticeCount; i++) {
			let index1 = this.particles.length - verticeCount - 1 + i;
			let index2 = this.particles.length - 1;
			this.springs.push(new Spring(this.particles[index1], this.particles[index2], radius, 100));
		}

	}
}


class Point {
	/*
		Just a 2D point, (x,y)
	*/
	constructor(x,y) {
		this.x = x;
		this.y = y;
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
		return Math.atan(((this.y*other.x - this.x*other.y)/(this.x*other.x + this.y*other.y)));
	}
	normal() {
		return new Point(-this.y, this.x);
	}

	renderPos() {	// Returns position of point if it were to be rendered in simulation rectangle
		return new Point(
			this.constructor.renderRect.x + this.constructor.renderRect.w * (this.x-this.constructor.simRect.x)/this.constructor.simRect.w,
			this.constructor.renderRect.y + this.constructor.renderRect.h * (1 - (this.y-this.constructor.simRect.y)/this.constructor.simRect.h)
		);
	}

	mousePos() {	// Returns a point that represents mouse pos on screen
		return new Point(
			this.constructor.simRect.x + this.constructor.simRect.w * (main.mouseDown.x - this.constructor.renderRect.x) / this.constructor.renderRect.w, 
			this.constructor.simRect.y + this.constructor.simRect.h * (this.constructor.renderRect.h - main.mouseDown.y + this.constructor.renderRect.y) / this.constructor.renderRect.h
		);
	}
}

class Particle {
	constructor(pos, renderRadius=5) {

		this.pos = pos;
		this.vel = new Point(0,0);	//{x:(Math.random()-0.5)*300, y:0};
		this.force = new Point(0,0);

		this.mass = 1;

		this.gravity = -2;

		this.particleRepel = 0;//0.1;


		this.renderRadius = renderRadius;
		this.renderColour = "blue";

	}
	render() {

		let renderPos = this.pos.renderPos();

		drawCircle(
			renderPos.x, 
			renderPos.y, 
			this.renderRadius, false, 1, this.renderColour);

	}
	update(dt) {

		// Apply gravitational force
		this.force.y += this.gravity * this.mass;

		// Apply force onto particles
		this.vel.x += this.force.x / this.mass * dt;
		this.vel.y += this.force.y / this.mass * dt;

		// Reset force
		this.force.set(0,0);

		// Friction to reduce energy in system
		this.vel.x *= 0.99;
		this.vel.y *= 0.99;

		// Move particle based on velocity
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;

	}
	repel(particle) {
		let distBetween = this.pos.distFrom(particle.pos);
		if (distBetween >= 1) return;
		this.force.x += this.particleRepel * particle.particleRepel * ((this.pos.x - particle.pos.x) / distBetween) * 1/distBetween**2;
		this.force.y += this.particleRepel * particle.particleRepel * ((this.pos.y - particle.pos.y) /  distBetween) * 1/distBetween**2;
	}
}

class Boundary {
	/*
		// == Boundary Force Producer ==
		As particle approach edges, apply linearly increasing force away from boundary
		Handles all 4 directions to enclose particle in a box if they are all greater than 0
	*/
	constructor(particleList, boundaries, strength) {

		// List of particles to apply forces onto
		this.particleList = particleList;

		// The boundaries (line position of the edges)
		// [minx, maxx, miny, maxy]
		this.boundaries = boundaries;

		// The strength of the boundary zone
		this.strength = strength;

	}
	render() {			

		drawLine([
			new Point(0, this.boundaries[2]).renderPos(), 
			new Point(16, this.boundaries[2]).renderPos()
		], "rgba(0,0,0,0.1)", 5);

	}
	update() {
		for (var i=0; i<this.particleList.length; i++) {
			// Min x
			if (this.particleList[i].pos.x < this.boundaries[0]) {
				this.particleList[i].force.x += this.strength * (this.boundaries[0] - this.particleList[i].pos.x);
			}

			// Max x
			if (this.particleList[i].pos.x > this.boundaries[1]) {
				this.particleList[i].force.x -= this.strength * (this.particleList[i].pos.x - this.boundaries[1]);
			}

			// Min y
			if (this.particleList[i].pos.y < this.boundaries[2]) {
				this.particleList[i].force.y += this.strength * (this.boundaries[2] - this.particleList[i].pos.y);
			}

			// Max y
			if (this.particleList[i].pos.y > this.boundaries[3]) {
				this.particleList[i].force.y -= this.strength * (this.particleList[i].pos.y - this.boundaries[3]);
			}
		}
	}
}

class Spring {
	/*
		Connects two particles together
		Each spring contains the points it connects
		Main has a list of springs, and the springs are updated each frame (and maybe rendered)
		After springs are updated, each particles is updated from the particle list
		Springs contain pointers to particles	

	*/
	constructor(particle1, particle2, length, strength=10) {
		// Force producer

		this.particle1 = particle1;
		this.particle2 = particle2;

		// The preffered length for the spring
		this.length = length;

		// The strength of the spring (force to pull/push back to preferred length)
		this.strength = strength;

	}
	render() {			
		let renderPos1 = this.particle1.pos.renderPos();
		let renderPos2 = this.particle2.pos.renderPos();

		drawLine([renderPos1, renderPos2], "black", 2);
	}
	update() {

		// Force = b * ((a-x) + (1/x-1/a))
		// where a=length of spring, b=strength of spring, x=dist between particles

		let distBetween = Math.hypot(this.particle1.pos.x-this.particle2.pos.x, this.particle1.pos.y-this.particle2.pos.y);

		//let forceStrength = this.strength * (this.length - distBetween  +  1/distBetween - 1/this.length);
		let forceStrength = this.strength * (this.length - distBetween);

		this.particle1.force.x += ((this.particle1.pos.x - this.particle2.pos.x) / distBetween) * forceStrength;
		this.particle1.force.y += ((this.particle1.pos.y - this.particle2.pos.y) / distBetween) * forceStrength;

		this.particle2.force.x -= ((this.particle1.pos.x - this.particle2.pos.x) / distBetween) * forceStrength;
		this.particle2.force.y -= ((this.particle1.pos.y - this.particle2.pos.y) / distBetween) * forceStrength;

	}
}



/*

	ctx.fillStyle = "#999999";
	ctx.fillRect(x, y, w, h);
	ctx.fillText("Hello World", x, y);

	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	ctx.fill();

	ctx.textAlign = "left";
	ctx.font = "bold 35px Verdana";

	ctx.beginPath();
	ctx.moveTo(canvas.width*0.5-10, canvas.height*0.5);
	ctx.lineTo(canvas.width*0.5+10, canvas.height*0.5);
	ctx.closePath();
	ctx.stroke();


	if (main.keyDown["Space"]) {}
	"ShiftLeft" "KeyW" "KeyS" "KeyD" "KeyA"

*/