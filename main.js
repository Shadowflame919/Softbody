
/*
	
	The main class for the program
	 - Contains the update and render loop
	 - Handles all the modes
	 - Holds the GAN and training data
	 - Also contains any other functions related to the project and univeral to multiple modes

*/


class Main {
	constructor() {

		this.mousePos = {x:-1,y:-1};	// Position from top left (start off screen to prevent dropdown hover)
		this.mouseOffset = {x:0,y:0};	// Relative offset from center of canvas
		this.mouseDown = {state:false, x:0, y:0};	// If and where mouse held down
		this.keyDown = {}

		this.buttons = [
		
		];

		this.navBar = new NavBar();

	}
	init() {

		// List of modes
		this.modeList = [
			new SimClass()
		];

		this.mode = this.modeList[0];

		// Init all the modes
		for (let i=0; i<this.modeList.length; i++) {
			this.modeList[i].init();
		}
	}
	testButtons() {
		// Only check button presses if not selecting options in nav bar
		if (main.navBar.topOptionSelected == undefined) {
			// Tests for clicks in global buttons
			for (let i in this.buttons) {
				// If button clicked, stop checking for button presses
				if (this.buttons[i].testForClick()) return;
			}

			// Tests for clicks in mode buttons
			this.mode.testButtons();
		} else {
			main.navBar.testForClick();
		}
	}
	testMouseDown() {
		this.mode.testMouseDown();
	}

	render() {

		fillCanvas("#DDDDDD");

		this.mode.render();

		// Render buttons
		for (let i in this.buttons) {	// Global buttons
			this.buttons[i].render();
		}

		// Render navigation bar last so that dropdown overlays other screen elements
		this.navBar.render();
		
	}
	update() {

		this.mode.update();

	}



}

