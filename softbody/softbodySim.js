/*



*/

class SoftbodySim {
	constructor() {

		this.renderRect = {x:40, y:80, w:800, h:500};
		this.simRect = {x:0, y:0, w:20, h:12.5};		// All particles are kept within this area
		//this.visibleRect = {}		// Actual rendering area for simulation

		Point.renderRect = this.renderRect;
		Point.simRect = this.simRect;


		this.particles = [];
		this.springs = [];

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
		
		// Rotate object on spot
		/*
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
			this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 500, "red"));
		}

		if (verticeCount > 3) {
			// Connect particles one apart to retain side length shape/structure
			for (var i=0; i<verticeCount; i++) {
				let index1 = i;
				let index2 = (i+2)%verticeCount;
				let springLength = particleList[index1].distFrom(particleList[index2]);
				this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 500, "rgba(0,0,0,0.2)"));
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