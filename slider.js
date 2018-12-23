

class Slider {
	constructor(info) {

		this.rect = info.rect;	// Rectangle of slider
		this.radius = info.radius;	// Radius of slider ball
		this.bounds = info.bounds;	// Object containing min and max values
		this.value = info.value;	// Function that returns current value of slider
		this.setValue = info.setValue;	// Parameter is new value, should set some variable to this value
		this.intValue = info.intValue;	// True if values must be integers
		this.hideText = info.hideText;	// True if text is not displayed to the right

		this.colourCircleDefault = "#666666";	// Default colour
		this.colourCircleHover = "#555555";		// Colour when mouse hovering
		this.colourCircleSelected = "#444444";	// Colour when selected

		// Stores whether slider is currently selected by mouse
		// If user holds mouse while hovering in circle, selected is set to true
		// Selected remains true until (main.mouseDown.state == false)
		this.selected = false;

	}
	render(hoverInteract=true) {

		// Find position of slider circle on screen
		let circleX = this.rect.x + this.rect.w * (this.value()-this.bounds.min)/(this.bounds.max-this.bounds.min);
		let circleY = this.rect.y + this.rect.h/2;

		// Find correct colour of slider circle
		let currentColour = this.colourCircleDefault;
		if (hoverInteract && main.navBar.topOptionSelected == undefined) {	// Only change colour in not in nav bar
			// Change colour if mouse hovering
			if (Math.hypot((circleX-main.mousePos.x), (circleY-main.mousePos.y)) <= this.radius) {	
				currentColour = this.colourCircleHover;
			}
		}
		if (this.selected) currentColour = this.colourCircleSelected;

		// Draws background slider rect
		drawRect(this.rect, "#777777", 2, "#999999");

		// Draws slider circle
		drawCircle(circleX, circleY, this.radius, "#444444", 3, currentColour);

		// Draw value to the right of slider
		if (!this.hideText) {
			let textValue = this.value();
			if (!this.intValue) textValue = textValue.toFixed(2);	// Convert to 2d.p. if float
			drawText(textValue, this.rect.x+this.rect.w+25, this.rect.y+11, 20, "black");
		}

	}
	update() {
		
		// Keep setting slider value while slider is selected
		if (this.selected) {
			// Ratio of mouse pos to rect
			let newValue = (main.mousePos.x - this.rect.x) / this.rect.w;	

			newValue = Math.max(newValue, 0);	// Stops sliding too far left
			newValue = Math.min(newValue, 1);	// Stops sliding too far right

			// Scale ratio to value bounds and add minimum
			newValue = this.bounds.min + newValue*(this.bounds.max-this.bounds.min);	

			// Convert to integer if necessary
			if (this.intValue) {
				newValue = Math.round(newValue)
			}	

			this.setValue(newValue);	// Change actual reference variable
		}
	}
	testForHold() {		// Tests for hold (mouse down), return true if slider was selected
		// Get position of slider circle on screen
		let circleX = this.rect.x + this.rect.w * (this.value()-this.bounds.min)/(this.bounds.max-this.bounds.min);
		let circleY = this.rect.y + this.rect.h/2;
		
		// If mouse within slider circle
		if (Math.hypot((circleX-main.mousePos.x), (circleY-main.mousePos.y)) <= this.radius) {
			this.selected = true;
			return true;
		}
		return false;
	}
	testForLift() {
		this.selected = false;
	}
}
