

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
		//this.vel.x *= 0.99;
		//this.vel.y *= 0.99;

		// Move particle based on velocity
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;

		// Simulation walls
		let bounceLoss = 0.5;
		if (this.pos.y <= 0) {
			this.pos.y = -this.pos.y;
			this.vel.y *= -bounceLoss;
		}
		if (this.pos.x <= 0) {
			this.pos.x = -this.pos.x;
			this.vel.x *= -bounceLoss;
		}
		if (this.pos.x >= 16) {
			this.pos.x = 2*16 - this.pos.x;
			this.vel.x *= -bounceLoss;
		}
		if (this.pos.y >= 10) {
			this.pos.y = 2*10 - this.pos.y;
			this.vel.y *= -bounceLoss;
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