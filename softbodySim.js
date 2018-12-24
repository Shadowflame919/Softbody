/*

	Two particles have a connection
	A connection is simply a preffered distance between one another
	Too far apart and they will be attracted, too close together and they will repel

	Could use  F = -(1/x + x - 2)  as the force formula
	This follows the spring formula F=-kx for large values and for small values the force increases rapidly as distance approaches zero

	Something like y=x-d is not possible because the distance between the points cannot be negative


	

	Force producer which keeps the angle between edges the same as how they started

	Someone applied the particle-spring method to create a good softbody sim
	https://www.youtube.com/watch?v=S95oZXSeKvE



	Apply damping force better
	Have the damping force inside of the softbody rather than an extenal force applied to each particles velocity
	Have the springs themselves causes this damping force, as a spring changes size, apply a force in the opposite direction
	This means if a spring was increasing in size due to kinetic energy, a force would apply in the opposite direction

	Also add deformability
	If a spring extends too far it will permantently change its length

	Friction?
	Particle collision with springs

	Try out different softbody types likes ropes (with fixed points)
	Also this allows for an easy double, triple etc pendulum for my reinforcement learner to balance

	Add mouse movement of objects by having an attraction for one particle to the mouse

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

		this.draggingParticle = undefined;

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

		// Apply particle mouse dragging force
		if (main.mouseDown.state == false) this.draggingParticle = undefined;
		if (this.draggingParticle != undefined) {
			let draggingSpring = new Spring(this.draggingParticle, new Particle(new Point().mousePos()), 0, 20);
			draggingSpring.update();
		}

		// Apply gravity force producer

		// Apply boundary force producer
		this.boundary.update();

		// Apply spring force producer
		for (let i=0; i<this.springs.length; i++) {
			this.springs[i].update();
		}

		/*
		// Apply particle force producer between each particleo
		for (let i=0; i<this.particles.length; i++) {
			for (let j=0; j<i; j++) {
				this.particles[i].repel(this.particles[j]);
				this.particles[j].repel(this.particles[i]);
			}
		}
		*/

		
		// Rotate object on spot
		if (this.particles.length > 0) {
			let highestParticle = 0;
			let lowestParticle = 0;
			for (let i=1; i<this.particles.length; i++) {
				if (this.particles[i].pos.y > this.particles[highestParticle].pos.y) highestParticle = i;
				if (this.particles[i].pos.y < this.particles[lowestParticle].pos.y) lowestParticle = i;
			}
			this.particles[highestParticle].force.x += 1;
			this.particles[lowestParticle].force.x -= 1;
		}
		


		// Update particle velocity and position (also gravity)
		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].update(dt);
		}

	}
	dragParticle() {

		let closestDist = Infinity;
		for (let i=0; i<this.particles.length; i++) {
			let dist = new Point().mousePos().distFrom(this.particles[i].pos);
			if (dist < closestDist) {
				closestDist = dist;
				this.draggingParticle = this.particles[i];
			}
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

			this.spawnCircle(12);

		} else if (main.keyDown["KeyU"]) {

			let p1 = new Particle(new Point().mousePos(), 3);
			let p2 = new Particle(new Point().mousePos().add(new Point(1, 0)), 3);
			let p3 = new Particle(new Point().mousePos().add(new Point(0, -1)), 3);

			this.particles.push(p1);
			this.particles.push(p2);
			this.particles.push(p3);

			this.springs.push(new Spring(p1, p2, 1, 100));
			this.springs.push(new Spring(p1, p3, 1, 100));
			this.springs.push(new Spring(p2, p3, 1.41, 100));

		} else if (main.keyDown["KeyY"]) {
			this.spawnSquare(2);
		}
	}
	spawnCircle(verticeCount) {
		let radius = 1;
		let particleList = [];

		for (var i=0; i<verticeCount; i++) {
			let angle = i/verticeCount * Math.PI * 2;
			particleList.push(
				new Particle(new Point().mousePos().add(new Point(
					radius*Math.cos(angle), 
					radius*Math.sin(angle)
				)), 1)
			);
			this.particles.push(particleList[i]);
		}

		// Connect adjacent particles with springs to retain individual side length
		for (var i=0; i<verticeCount; i++) {
			let index1 = i;
			let index2 = (i+1)%verticeCount;
			let springLength = particleList[index1].distFrom(particleList[index2]);
			this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 100, "red"));
		}

		if (verticeCount > 3) {
			// Connect particles one apart to retain side length shape/structure
			for (var i=0; i<verticeCount; i++) {
				let index1 = i;
				let index2 = (i+2)%verticeCount;
				let springLength = particleList[index1].distFrom(particleList[index2]);
				this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 200, "rgba(0,0,0,0.2)"));
			}
		}

		/*
		// Connect middle to springs
		this.particles.push(
			new Particle(new Point().mousePos(), 1)
		);
		for (var i=0; i<verticeCount; i++) {
			let index1 = this.particles.length - verticeCount - 1 + i;
			let index2 = this.particles.length - 1;
			this.springs.push(new Spring(this.particles[index1], this.particles[index2], radius, 100));
		}*/

	}
	spawnSquare(sideLength) {
		let sideSize = 2;
		let particleList = [];

		for (var y=0; y<sideLength; y++) {
			for (var x=0; x<sideLength; x++) {
				if (y!=0 && y!=sideLength-1 && x!=0 && x!=sideLength-1) continue;

				let pos = new Point().mousePos().add(new Point( (x/sideLength-0.5)*sideSize, (y/sideLength-0.5)*sideSize ));
				let particle = new Particle(pos, 3);

				particleList.push(particle);
				this.particles.push(particle);

				/*
				// Connect with particle above it
				if (y>0) {
					let index1 = y*sideLength + x;
					let index2 = (y-1)*sideLength + x;
					let springLength = particleList[index1].distFrom(particleList[index2]);
					this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 100, "red"));
				}

				if (x>0) {
					let index1 = y*sideLength + x;
					let index2 = y*sideLength + x - 1;
					let springLength = particleList[index1].distFrom(particleList[index2]);
					this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 100, "red"));
				}

				if (x>0 && y>0) {
					let index1 = y*sideLength + x;
					let index2 = (y-1)*sideLength + x - 1;
					let springLength = particleList[index1].distFrom(particleList[index2]);
					this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 1000, "red"));
				}

				if (y>0 && x<sideLength-1) {
					let index1 = y*sideLength + x;
					let index2 = (y-1)*sideLength + x + 1;
					let springLength = particleList[index1].distFrom(particleList[index2]);
					this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 1000, "red"));
				}*/
			}
		}

		for (var i=0; i<particleList.length; i++) {
			for (var j=0; j<i; j++) {

				let index1 = i;
				let index2 = j;
				let springLength = particleList[index1].distFrom(particleList[index2]);
				this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 30, "rgba(0,0,0,0.2)"));

			}
		}


		/*for (var s=0; s<4; s++) {
			for (var i=0; i<sideLength; i++) {
				let sideDist = sideSize * (i/sideLength - 0.5);
				let sidePoint = new Point().mousePos();

				if (s==0) sidePoint = sidePoint.add(new Point(sideDist, 0.5*sideSize));
				else if (s==1) sidePoint = sidePoint.add(new Point(0.5*sideSize, -sideDist));
				else if (s==2) sidePoint = sidePoint.add(new Point(-sideDist, -0.5*sideSize));
				else if (s==3) sidePoint = sidePoint.add(new Point(-0.5*sideSize, sideDist));

				particleList.push(new Particle(sidePoint, 3));
				this.particles.push(particleList[s*sideLength + i]);
			}
		}

		// Connect adjacent particles with springs to retain individual side length
		for (var i=0; i<particleList.length; i++) {
			let index1 = i;
			let index2 = (i+1)%particleList.length;
			let springLength = particleList[index1].distFrom(particleList[index2]);
			this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 100, "red"));
		}
		
		if (sideLength > 3) {
			// Connect particles one apart to retain side length shape/structure
			for (var i=0; i<particleList.length; i++) {
				let index1 = i;
				let index2 = (i+4)%particleList.length;
				let springLength = particleList[index1].distFrom(particleList[index2]);
				this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 100, "rgba(0,0,0,0.2)"));
			}
		}*/

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
			this.constructor.simRect.x + this.constructor.simRect.w * (main.mousePos.x - this.constructor.renderRect.x) / this.constructor.renderRect.w, 
			this.constructor.simRect.y + this.constructor.simRect.h * (this.constructor.renderRect.h - main.mousePos.y + this.constructor.renderRect.y) / this.constructor.renderRect.h
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

		this.particleRepel = 0.1;


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
		this.vel.x *= 0.98;
		this.vel.y *= 0.98;

		// Move particle based on velocity
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;

		if (this.pos.y <= 2) {
			this.pos.y = 2 + (2-this.pos.y);
			this.vel.y *= -0.99;
		}

	}
	repel(particle) {
		let distBetween = this.pos.distFrom(particle.pos);
		if (distBetween >= 1) return;
		this.force.x += this.particleRepel * particle.particleRepel * ((this.pos.x - particle.pos.x) / distBetween) * 1/distBetween**2;
		this.force.y += this.particleRepel * particle.particleRepel * ((this.pos.y - particle.pos.y) /  distBetween) * 1/distBetween**2;
	}
	distFrom(particle) {
		return this.pos.distFrom(particle.pos);
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
	constructor(particle1, particle2, length, strength=10, colour="black") {
		// Force producer

		this.particle1 = particle1;
		this.particle2 = particle2;

		// The preffered length for the spring
		this.length = length;

		// The strength of the spring (force to pull/push back to preferred length)
		this.strength = strength;

		this.colour = colour
	}
	render() {			
		let renderPos1 = this.particle1.pos.renderPos();
		let renderPos2 = this.particle2.pos.renderPos();

		drawLine([renderPos1, renderPos2], this.colour, 2);
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