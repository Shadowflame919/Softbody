
/*


*/

class Softbody_Mode {
	constructor() {

		this.name = "Sim";

		this.buttons = [
			new Button({
				text: "Dragging",
				rect: {x:900, y:280, h:30, w:150},
				action: ()=>{
					this.sim.mouseAction = "dragging";
				}
			}),
			new Button({
				text: "Triangle",
				rect: {x:900, y:320, h:30, w:150},
				action: ()=>{
					this.sim.mouseAction = "spawn triangle";
				}
			}),
			new Button({
				text: "Square",
				rect: {x:900, y:360, h:30, w:150},
				action: ()=>{
					this.sim.mouseAction = "spawn square";
				}
			}),
			new Button({
				text: "Pentagon",
				rect: {x:900, y:400, h:30, w:150},
				action: ()=>{
					this.sim.mouseAction = "spawn pentagon";
				}
			}),
			new Button({
				text: "Particle",
				rect: {x:900, y:440, h:30, w:150},
				action: ()=>{
					this.sim.mouseAction = "spawn particle";
				}
			}),
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

		drawText("Particles: " + this.sim.particles.length, 900, 100, 18);
		drawText("Springs: " + this.sim.springs.length, 900, 130, 18);


		drawText(this.sim.mouseAction, 900, 250, 18);

	}
	update() {

		this.sim.update();


	}


}
