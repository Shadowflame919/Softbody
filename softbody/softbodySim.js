/*

	Collisions of particles with springs...

	After finding point of collision:

		Flip starting and ending point across line.
			First find closest point from end/start particle point to the surface line.
			This can be achieved by creating a normal line from the surface that passes through each point, and find its intersection with the surface
			Then get vector from particle point to intersection, and add this to intersection to get the reflected point
		The end point represents the new position of the particle.
		A vector from the starting point to the end point will represent path of the point per frame
		To calculate new velocity from this, divide each dimention by delta
		Then the new velocity can have a vector added to simulate friction
			

		OR


		Calculate angle of intersection between both lines (angle = θ)

		Find bounced back position of particle:
			Get vector between new point and collision point
			Rotate this vector by 2θ
			Add this vector to collision point and this is new particle point

		Rotate velocity vector by 2θ






	After a collision, what should happen to velocity of object?
	An easy solution is to simply scale vector down by a factor like 0.8 for example.
		This would mean after bouncing, the object would experience friction in the direction of travel,
		and also would experience a loss of energy from a bounce.
		Both of these values would remain the same, say 0.8 loss both parallel and perpendicular to the collision surface.

	A more realistic collision would involve seperate vertical and horizontal force on the velocity
		This means after a collision, the particle would experience a force perpendicular to the surface,
		and a seperate force parallel to represent friction.
		This would allow for objects that bounce, but are also affected by friction.
	
	If both were applied equally, you would not be able to have a system that both has friction, and allows object to preserve energy on their bounces.
	If the spring damping is low this would not be a problem since objects already lose most of their perpendicular velocity after bouncing.

	I will multiply both by the same value for now, as this is both faster and much much easier to implement.
	However I should not forget the possiblity of the other if the desired effects in the simulation are not obtainable with the simple bounce loss solution.


*/

class SoftbodySim {
	constructor() {

		this.renderRect = {x:40, y:80, w:800, h:500};
		this.simRect = {x:0, y:0, w:20, h:12.5};		// All particles are kept within this area
		//this.visibleRect = {}		// Actual rendering area for simulation

		Point.prototype.renderRect = this.renderRect;
		Point.prototype.simRect = this.simRect;

		this.particles = [];
		this.springs = [];

		this.walls = [
			{
				p1: new Point(3,3),
				p2: new Point(12,7)
			}
		];


		this.draggingParticle = undefined;

		// Mouse actions
		// dragging, spawn square, spawn triangle, spawn pentagon
		this.mouseAction = "dragging";


	}
	render() {

		// Background rectangle
		drawRect(this.renderRect, "black", 2, "grey");

		// Render springs
		for (let i=0; i<this.springs.length; i++) {
			this.springs[i].render();
		}

		// Render particles
		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].render();
		}

		// Render walls
		for (let i=0; i<this.walls.length; i++) {
			drawLine([this.walls[i].p1.renderPos(), this.walls[i].p2.renderPos()], "rgb(127,0,127)", 3);
		}
		
	}
	update(dt=1/60) {

		// Have a bunch of different force producers (gravity, springs, boundaries, walls, etc)
		// Each update, the force produces are updated to apply forces onto each particle based on its position
		// For optimisation, force producers can skip certain particles that do not lie within the force producers reasonable range

		// Apply particle mouse dragging force
		if (main.mouseDown.state == false) this.draggingParticle = undefined;
		if (this.draggingParticle != undefined) {
			let draggingSpring = new Spring(this.draggingParticle, new Particle(new Point().mousePos()), 0, 50);
			draggingSpring.update();
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
		
		/*
		// Rotate object on spot
		if (this.particles.length > 0) {
			let highestParticle = 0;
			let lowestParticle = 0;
			for (let i=1; i<this.particles.length; i++) {
				if (this.particles[i].pos.y > this.particles[highestParticle].pos.y) highestParticle = i;
				if (this.particles[i].pos.y < this.particles[lowestParticle].pos.y) lowestParticle = i;
			}
			this.particles[highestParticle].force.x += 5;
			this.particles[lowestParticle].force.x -= 5;
		}*/

		
		// Update springs to apply forces on particles
		for (let i=0; i<this.springs.length; i++) {
			this.springs[i].update();
		}

		// Update particle velocity and position (also gravity)
		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].update(dt);


			// Update wall collision for particle
			for (let j=0; j<this.walls.length; j++) {

				let collision = collisionBetweenLineSegments(this.particles[i].oldPos, this.particles[i].pos, this.walls[j].p1, this.walls[j].p2);

				//console.log(collision)

				// Apply collision physics
				

			}


		}

	}
	onMouseClick() {	// Runs when the mouse is clicked (lifted after being pressed down)
		// Only spawn if pressed inside simulation rect
		if (pointInRect(main.mousePos, this.renderRect)) {
			this.spawnObject();
		}
	}
	onMouseDown() {		// Runs when mouse button goes down (not repeated)
		if (this.mouseAction == "dragging" && pointInRect(main.mouseDown, this.renderRect)) {
			this.selectDraggingParticle();
		}
	}


	selectDraggingParticle() {		// Selects the particle to begin dragging based on mouse position

		let closestDist = Infinity;
		for (let i=0; i<this.particles.length; i++) {
			let dist = new Point().mousePos().distFrom(this.particles[i].pos);
			if (dist < closestDist) {
				closestDist = dist;
				this.draggingParticle = this.particles[i];
			}
		}

	}

	spawnObject() {

		if (this.mouseAction == "spawn triangle") {
			this.spawnPolygon(3);
		} else if (this.mouseAction == "spawn square") {
			this.spawnPolygon(4);
		} else if (this.mouseAction == "spawn pentagon") {
			this.spawnPolygon(5);
		} else if (this.mouseAction == "spawn particle") {
			this.particles.push(
				new Particle(new Point().mousePos())
			);
		}

	}
	spawnPolygon(verticeCount) {
		let radius = 1;
		let particleList = [];
		let sideStrength = 1000;
		let innerStrength = 1000;

		for (var i=0; i<verticeCount; i++) {
			let angle = i/verticeCount * Math.PI * 2;
			particleList.push(
				new Particle(new Point().mousePos().add(new Point(
					radius*Math.cos(angle), 
					radius*Math.sin(angle)
				)), 3)
			);
			this.particles.push(particleList[i]);
		}

		// Connect adjacent particles with springs to retain individual side length
		for (var i=0; i<verticeCount; i++) {
			let index1 = i;
			let index2 = (i+1)%verticeCount;
			let springLength = particleList[index1].distFrom(particleList[index2]);
			this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, sideStrength, "red"));
		}

		if (verticeCount > 3) {
			// Connect particles one apart to retain side length shape/structure
			for (var i=0; i<verticeCount; i++) {
				let index1 = i;
				let index2 = (i+2)%verticeCount;
				let springLength = particleList[index1].distFrom(particleList[index2]);
				this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, innerStrength, "rgba(0,0,0,0.2)"));
			}
		}

		/*
		// Connect middle to springs
		this.particles.push(
			new Particle(new Point().mousePos(), 3)
		);
		for (var i=0; i<verticeCount; i++) {
			let index1 = this.particles.length - verticeCount - 1 + i;
			let index2 = this.particles.length - 1;
			this.springs.push(new Spring(this.particles[index1], this.particles[index2], radius, 500, "rgba(0,0,0,0.1)"));
		}*/

	}
}






function collisionBetweenLineSegments(A1, A2, B1, B2) {		// Returns the collision point between two line segments, otherwise returns false

	/// First check if bounding boxes collide

	// Check lines are within x boundary
	if (Math.min(A1.x, A2.x) > Math.max(B1.x, B2.x)) return false;
	if (Math.min(B1.x, B2.x) > Math.max(A1.x, A2.x)) return false;

	// Check lines are within y boundary
	if (Math.min(A1.y, A2.y) > Math.max(B1.y, B2.y)) return false;
	if (Math.min(B1.y, B2.y) > Math.max(A1.y, A2.y)) return false;

	// Find gradients of both lines
	let Am = (A2.y - A1.y) / (A2.x - A1.x);
	let Bm = (B2.y - B1.y) / (B2.x - B1.x);

	// If Am == Bm, lines are parallel and can only be colliding if a point from one line lies on the other
	// This can be tested by subbing a point into y-y1=m(x-x1)
	// Current simulation does not need to take this case into account and can just return false for now
	if (Am == Bm) return false;

	// Calculate x value of collision
	let Cx = (Am*A1.x - Bm*B1.x + B1.y - A1.y) / (Am - Bm);

	// If Cx == NaN, atleast one of the line segments are vertical (have (+/-) Infinity gradient)
	// If this is true, a seperate calculation can be performed to determine collision point
	if (isNaN(Cx)) {
		if (!isFinite(Am)) {	// If A is vertical
			if (!isFinite(Bm)) return false;	// If B is also vertical, lines are parallel and are NOT colliding

			// Since A is vertical, sub A.x into B and check y coord lies on A
			// x bounds don't need to be checked for A.x since it passed the boundary box test
			let Cy = Bm*(A1.x - B1.x) + B1.y;
			if (Math.min(A1.y, A2.y) <= Cy && Cy <= Math.max(A1.y, A2.y)) {		// Check y coord lies on A
				return {x:A1.x, Cy};
			} else {	// If y coord does not lie on A, segments are NOT colliding
				return false;
			}

		} else {	// If A is not vertical, B must be vertical
		
			// Since B is vertical, sub B.x into A and check y coord lies on A
			// x bounds don't need to be checked for B.x since it passed the boundary box test
			let Cy = Am*(B1.x - A1.x) + A1.y;
			if (Math.min(B1.y, B2.y) <= Cy && Cy <= Math.max(B1.y, B2.y)) {		// Check y coord lies on B
				return {x:B1.x, y:Cy};
			} else {	// If y coord does not lie on B, segments are NOT colliding
				return false;
			}

		}
	}

	// Check this x value lies within bounds of both segments
	if (Cx < Math.min(A1.x, A2.x) || Cx > Math.max(A1.x, A2.x)) return false;	// Line segment A
	if (Cx < Math.min(B1.x, B2.x) || Cx > Math.max(B1.x, B2.x)) return false;	// Line segment B

	// As collision point x value is within x boundaries of both non-vertical line segments, they must be colliding and can return y value
	let Cy = Am*(Cx - A1.x) + A1.y;

	return {x:Cx, y:Cy};
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