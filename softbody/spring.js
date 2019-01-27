

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


		this.oldLength = this.length;

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

		if (distBetween > this.length && distBetween < this.oldLength) {
			forceStrength *= 0.2;
		}
		if (distBetween < this.length && distBetween > this.oldLength) {
			forceStrength *= 0.2;
		}
		this.oldLength = distBetween;

		this.particle1.force.x += ((this.particle1.pos.x - this.particle2.pos.x) / distBetween) * forceStrength;
		this.particle1.force.y += ((this.particle1.pos.y - this.particle2.pos.y) / distBetween) * forceStrength;

		this.particle2.force.x -= ((this.particle1.pos.x - this.particle2.pos.x) / distBetween) * forceStrength;
		this.particle2.force.y -= ((this.particle1.pos.y - this.particle2.pos.y) / distBetween) * forceStrength;

	}
}
