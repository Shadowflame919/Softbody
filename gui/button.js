

class Button {
	constructor(info) {

		this.text = info.text;
		this.rect = info.rect;
		this.action = info.action;
		this.parent = info.parent;

		this.fontSize = Math.round(info.rect.h * 0.6);

		this.colourDefault = "#999999";	// Default colour
		this.colourHover = "#777777";	// Colour when mouse hovering

	}
	render(hoverInteract=true) {	// hoverInterect determines if mouse hovering will change colour

		// Find correct colour of button rect
		let currentColour = this.colourDefault;
		if (hoverInteract && main.navBar.topOptionSelected == undefined) {	// Only change colour in not in nav bar
			if (pointInRect(main.mousePos, this.rect)) {	// Change colour if mouse hovering
				currentColour = this.colourHover;
			}
		}
		drawRect(this.rect, "#555555", 2, currentColour)

		let renderPos = {	// Calculate text rendering position
			x: this.rect.x + this.rect.w/2,
			y: this.rect.y + Math.round(this.rect.h*(5/7))
		}
		drawText(this.text, renderPos.x, renderPos.y, this.fontSize, "black", "center")

	}
	testForClick() {	// Tests for click, return true if button was pressed
		// Button only pressed iff mouse was pressed inside button, and was lifted inside button
		if (pointInRect(main.mouseDown, this.rect) && pointInRect(main.mousePos, this.rect)) {
			this.action();
			return true;
		}
		return false;
	}
}
