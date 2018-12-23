
/*
	Contains code for the navBar class
	 - handles most navigation throughout program and through modes with a dropdown menu

*/


class NavBar {
	constructor() {

		this.navRect = {x:0, y:0, w:1120, h:40};

		this.buttons = [

		];

		// Dropdown structure of nav bar
		this.dropDown = {
			"File": {
				"Import NN": function() {
					uploadElement.value = "";
					uploadElement.click();
				},
				"Export NN": function() {
					main.downloadNN();
				}
			},
			"Mode": {
				"Sim": function() {
					main.mode = main.modeList[0];
				}
			}
		}

		this.topOptionWidth = 70;	// Width of each top option excluding text width
		this.topOptionTextSize = 20;
		this.topOptionColourSelect = "#AAAAAA";

		this.dropdownOptionWidth = 200;		// Width of each dropdown option including text width
		this.dropdownOptionHeight = 40;		// Height to dropdown options
		this.dropdownOptionColour = "#333333";	// Colour of dropdown option
		this.dropdownOptionColourSelect = "#555555";	// Colour of selected dropdown option

		this.topOptionSelected = undefined;		// Currently selected top option in navBar
		this.dropdownOptionSelected = undefined;	// Currently hovered sub-option in dropdown

	}
	render() {
		// Renders entire navigation bar + dropdowns
		// Handles detecting mouse position over dropdowns, but not clicking
		// Dropdown clicking is handled a seperate function


		// Top navigation bar
		drawRect(this.navRect, false, 1, "#BBBBBB");

		// Mode name in top right
		drawText(main.mode.name, 1100, 27, 20, "black", "right");


		// Render dropdown options
		let renderTextX = 0;
		for (let option in this.dropDown) {
			// Text length is used to determine option width
			let textLength = drawTextLength(option, this.topOptionTextSize);

			// Rectangle containing each option
			let optionRect = {
				x: renderTextX,
				y: 0,
				w: this.topOptionWidth + textLength,
				h: this.navRect.h
			}


			// If has selected option
			if (this.topOptionSelected == option) {
				// Render coloured rectangle behind top option if selected
				drawRect(optionRect, false, 1, this.topOptionColourSelect);

				this.renderDropdown(optionRect);

				// If not selected option in dropdown, remove top selected option
				if (this.dropdownOptionSelected == undefined) {
					this.topOptionSelected = undefined;
				}
			}

			// If hovering over top option, select it
			if (pointInRect(main.mousePos, optionRect)) {
				this.topOptionSelected = option;
			}

			// Renders text of each top dropdown option
			renderTextX += this.topOptionWidth/2 + textLength/2;	// Move to center of current option
			drawText(option, renderTextX, 27, this.topOptionTextSize, "black", "center");	
			renderTextX += textLength/2 + this.topOptionWidth/2;	// Go to edge of option

			// Line in between dropdown options
			drawText("|", renderTextX, 27, this.topOptionTextSize, "grey", "center");	
		}

		// Top navigation bar
		drawRect(this.navRect, "black", 1);

	}
	renderDropdown(optionRect) {	// Renders a dropdown for the current selected top option
		// Parameter optionRect is rectangle of selected top option used for positioning dropdown

		// Loop through each dropdown option
		this.dropdownOptionSelected = undefined;	// Assume false and then check if true
		let renderDropdownY = optionRect.y + optionRect.h;
		for (let dropdownOption in this.dropDown[this.topOptionSelected]) {

			let dropdownOptionColour = this.dropdownOptionColour;

			// Rectangle of dropdown option
			let dropdownOptionRect = {
				x: optionRect.x,
				y: renderDropdownY,
				w: this.dropdownOptionWidth,
				h: this.dropdownOptionHeight
			}

			// If hovering over dropdown option
			if (pointInRect(main.mousePos, dropdownOptionRect)) {
				// Select the dropdown option being mouse hovered
				this.dropdownOptionSelected = dropdownOption;

				// Change colour if hovering
				dropdownOptionColour = this.dropdownOptionColourSelect;
			}

			// Draw dropdown filled rectangle
			drawRect(dropdownOptionRect, "#777777", 2, dropdownOptionColour);

			// Draw dropdown option text
			let dropdownTextX = dropdownOptionRect.x + this.topOptionWidth/2;
			let dropdownTextY = renderDropdownY + 27;
			drawText(dropdownOption, dropdownTextX, dropdownTextY, this.topOptionTextSize, "white");	

			renderDropdownY += dropdownOptionRect.h;
		}
	}
	testForClick() {
		// If hovering over dropdown option, user must have clicked it
		if (this.dropdownOptionSelected != undefined) {
			// Run dropdown function
			this.dropDown[this.topOptionSelected][this.dropdownOptionSelected]();

			// Remove selection after action
			this.topOptionSelected = undefined;
			this.dropdownOptionSelected = undefined;
		}
	}
}


			