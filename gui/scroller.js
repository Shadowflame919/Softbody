

class Scroller {
	constructor(info) {

		/* 
			Scrollers have bounds between two values, e.g. 0 - 1000 pixels
			Scrollers can display multiple values at once, e.g. - 100 pixel window height
			This means scroller value bounds for this example are 0 - 900 pixels (1000-100=900)
		*/

		this.rect = info.rect;	// Background rectangle of scroller
		this.displayPortion = info.displayPortion; // Portion of values displayed at any one time by scroller
		this.getBounds = info.getBounds;	// Function that returns object of min and max values
		this.getValue = info.getValue;	// Function that returns current value of slider
		this.setValue = info.setValue;	// Function where parameter is new value, should set some variable to this value

		this.colourScrollerDefault = "#666666";	// Default colour
		this.colourScrollerHover = "#606060";		// Colour when mouse hovering
		this.colourScrollerSelected = "#505050";	// Colour when selected

		// Stores whether scroller is currently selected by mouse
		// If user holds mouse while hovering in scroller rect, selected is set to true
		// Selected remains true until (main.mouseDown.state == false)
		this.selected = false;

		// Movable scroller rect
		this.scrollerRect = {
			x: this.rect.x + this.rect.w * 0.05,
			y: 0,
			w: this.rect.w * 0.9,
			h: 0
		}

		this.minScrollerHeight = this.rect.h * 0.06;	// Minimum scroller height in pixels

	}
	render() {

		// Find correct colour of scroll rect
		let currentColour = this.colourScrollerDefault;
		if (this.selected) {
			currentColour = this.colourScrollerSelected;
		} else if (main.navBar.topOptionSelected == undefined) {	// Only change colour in not in nav bar
			// Change colour if mouse hovering
			if (pointInRect(main.mousePos, this.scrollerRect)) {	
				currentColour = this.colourScrollerHover;
			}
		}

		// Draws background scroller rect
		drawRect(this.rect, "#777777", 2, "#999999");

		// Draws scroller rect
		drawRect(this.scrollerRect, "#333333", 2, currentColour);

		// Draws 3 lines inside of scroller rect because it looks nice
		let lineX1 = this.scrollerRect.x + this.scrollerRect.w*0.2;
		let lineX2 = lineX1 + this.scrollerRect.w*0.6;
		for (var i=-1; i<=1; i++) {
			let lineY = this.scrollerRect.y + this.scrollerRect.h*0.5 + this.minScrollerHeight*0.15*i;
			drawLine({x:lineX1, y:lineY}, {x:lineX2, y:lineY}, "#111111", 1);
		}

	}
	update() {
		// Keeps setting scroller value while selected

		// Gets bounds of scroller in case they have changed
		let bounds = this.getBounds();

		// Find new scroller rect height based on boundary size
		this.scrollerRect.h = this.displayPortion / (bounds.max - bounds.min);
		this.scrollerRect.h = Math.min(this.scrollerRect.h, 1);
		this.scrollerRect.h *= this.rect.h;
		this.scrollerRect.h = Math.max(this.scrollerRect.h, this.minScrollerHeight);

		// Find scroller y pos and set scroller value accordingly
		if (bounds.max - bounds.min <= this.displayPortion) {	// Not enough items to move scroller
			this.scrollerRect.y = this.rect.y;
		} else {
			// Scroller ratio of position to bordering rectangle
			this.scrollerRect.y = this.getValue() / (bounds.max - bounds.min - this.displayPortion);	

			this.scrollerRect.y *= this.rect.h - this.scrollerRect.h;	// Scale position based on background rect size
			this.scrollerRect.y += this.rect.y;		// Actual scroller position
		
			// Only sets new value if enough items to scroll
			if (this.selected) {
				// Set new value based on mouse position
				let newValue = (main.mousePos.y - this.rect.y - this.scrollerRect.h/2);
				newValue /= (this.rect.h - this.scrollerRect.h);	// Ratio of possible values
				newValue = Math.max(newValue, 0);	// Can't scroll too far up
				newValue = Math.min(newValue, 1);	// Can't scroll too far down

				// Scales ratio to bounds while accounting for the multiple values displayed at once
				newValue *= (bounds.max-bounds.min-this.displayPortion);
				newValue = Math.round(bounds.min + newValue);	// Adds minimum and rounds to int
				this.setValue(newValue);	// Actually changes reference scroller variable
			}
		}

	}
	testForHold() {		// Tests for hold (mouse down), return true if scroller was selected
		// If mouse within scroller rect
		if (pointInRect(main.mousePos, this.scrollerRect)) {	
			this.selected = true;	
			return true;
		}
		return false;
	}
	testForLift() {
		this.selected = false;
	}
}
