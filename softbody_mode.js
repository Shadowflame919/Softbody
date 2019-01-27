
/*


*/

class Softbody_Mode {
	constructor() {

		this.name = "Sim";

		this.buttons = [
			//new Button({
			//	text: "AutoTrain: Off",
			//	rect: {x:50, y:150, h:35, w:190},
			//	action: function() {
			//		main.mode.toggleAutoTrain();
			//	}
			//}),
		];


	}
	init() {
		

		this.sim = new SoftbodySim();


	}
	testButtons() {
		// Tests for clicks in buttons
		for (let i in this.buttons) {
			// If button clicked, stop checking for button presses
			if (this.buttons[i].testForClick()) break;
		}

		this.sim.onMouseClick();

	}
	testMouseDown() {

		this.sim.onMouseDown();

	}
	render() {
		// Render mode specific buttons
		for (let i in this.buttons) {	
			this.buttons[i].render();
		}

		this.sim.render();

		drawText("Particles: " + this.sim.particles.length, 900, 100, 24);

	}
	update() {

		this.sim.update();


	}


}
