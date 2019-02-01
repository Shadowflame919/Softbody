

class Particle {
	constructor(pos, renderRadius=5) {

		this.pos = pos;
		this.vel = new Point(0,0);	//{x:(Math.random()-0.5)*300, y:0};
		this.force = new Point(0,0);

		this.mass = 1;

		this.gravity = -3;		// Acceleration per second
		this.airFriction = 0.1;		// Multiple of velocity reduction per second

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

		/*
			Current system is split up into 
				adding starting force, 
				then change particle velocity and move particle
				then applying forces again to correct particle

			A possible fix is to move particle at the beginning of each frame and storing the force until the next update
				First change particle velocity and move particle
				Then sum up default forces on particle (gravity/air-friction/springs)
				Then sum up forces which are a result of new position and require a positional correction

		*/



		// Apply gravitational force
		this.force.y += this.gravity * this.mass;

		// Apply air friction force
		this.force.x -= this.vel.x * this.airFriction;
		this.force.y -= this.vel.y * this.airFriction;

		// Apply force onto particles
		this.vel.x += this.force.x / this.mass * dt;
		this.vel.y += this.force.y / this.mass * dt;

		// Move particle based on velocity
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;

		// Reset force for next calculation
		this.force.set(0,0);

		// Simulation walls
		let bounceLoss = 1;
		if (this.pos.y <= 0) {
			this.pos.y = -this.pos.y;
			this.vel.y *= -bounceLoss;
			this.vel.x *= 0.8;
		}
		if (this.pos.y >= 12.5) {
			this.pos.y = 2*12.5 - this.pos.y;
			this.vel.y *= -bounceLoss;
			this.vel.x *= 0.8;
		}
		if (this.pos.x <= 0) {
			this.pos.x = -this.pos.x;
			this.vel.x *= -bounceLoss;
			this.vel.y *= 0.8;
		}
		if (this.pos.x >= 20) {
			this.pos.x = 2*20 - this.pos.x;
			this.vel.x *= -bounceLoss;
			this.vel.y *= 0.8;
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