
/*
	A mode for generating and viewing images
	Can also save images as a png

*/

class TestClass {
	constructor() {

		this.name = "Testing";

		this.buttons = [
			new Button({
				text: "Bot Control: Off",
				rect: {x:650, y:100, h:35, w:190},
				action: function() {
					main.mode.toggleBotControl();
				}
			}),
			new Button({
				text: "Reset Game",
				rect: {x:650, y:150, h:35, w:190},
				action: function() {
					main.mode.testGame.newGame();
				}
			}),
			new Button({
				text: "Random Move",
				rect: {x:650, y:200, h:35, w:190},
				action: function() {
					main.mode.testGame.playRandomMove();
				}
			}),
			new Button({
				text: "Test Test Bot",
				rect: {x:650, y:250, h:35, w:190},
				action: function() {
					main.mode.testTestBot();
				}
			})
		];

	}
	init() {

		this.boardRect = {x:40, y:80, w:584, h:500};
		this.testGame = new Connect4Class();
		this.testGame.newGame();

		this.botControl = false;

		this.testGameCount = 500;		// Number of games played for a test
		this.testBotResults = [0,0,0,0,0,0];

	}
	testButtons() {
		// Test for clicking of tic tac toe board
		if (pointInRect(main.mousePos, this.boardRect)) {
			let move = Math.floor(6.99 * (main.mousePos.x - this.boardRect.x) / this.boardRect.w)
			this.testGame.playMove(move);
		}

		// Tests for clicks in buttons
		for (let i in this.buttons) {
			// If button clicked, stop checking for button presses
			if (this.buttons[i].testForClick()) break;
		}
	}
	testMouseDown() {}

	render() {

		this.testGame.render(this.boardRect);


		if (main.testBot.moveValues != undefined) {
			drawText(main.testBot.moveValues.map(x=>x.toFixed(2)), 650, 350, 20);
		}

		drawText(this.testBotResults, 650, 400, 20);

		// Win rate when playing first
		let firstWinRate = this.testBotResults[0] / (this.testGameCount/2);
		drawText(firstWinRate.toFixed(3), 650, 435, 20);

		// Win rate when playing second
		let secondWinRate = this.testBotResults[3] / (this.testGameCount/2);
		drawText(secondWinRate.toFixed(3), 750, 435, 20);

		// Win rate overall
		let overallWinRate = (firstWinRate + secondWinRate) / 2;
		drawText(overallWinRate.toFixed(3), 650, 470, 20);



		// Render mode specific buttons
		for (let i in this.buttons) {	
			this.buttons[i].render();
		}

	}
	update() {

		if (!this.testGame.gameOver) {
			if (this.testGame.turn==1 && this.botControl) {

				let botMove = main.testBot.getMove(this.testGame);
				this.testGame.playMove(botMove);

			}
		}

	}

}
