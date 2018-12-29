/*



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

		this.draggingParticle = undefined;

	}
	render() {

		// Background rectangle
		drawRect(this.renderRect, "black", 2, "grey");

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
		/*
		if (this.particles.length > 0) {
			let highestParticle = 0;
			let lowestParticle = 0;
			for (let i=1; i<this.particles.length; i++) {
				if (this.particles[i].pos.y > this.particles[highestParticle].pos.y) highestParticle = i;
				if (this.particles[i].pos.y < this.particles[lowestParticle].pos.y) lowestParticle = i;
			}
			this.particles[highestParticle].force.x += 1;
			this.particles[lowestParticle].force.x -= 1;
		}*/
		


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
				this.springs.push(new Spring(particleList[index1], particleList[index2], springLength, 500, "rgba(0,0,0,0.2)"));

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