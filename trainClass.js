
/*
	A mode for training the network

*/

class TrainClass {
	constructor() {

		this.name = "Training";

		this.buttons = [
			new Button({
				text: "AutoTrain: Off",
				rect: {x:50, y:150, h:35, w:190},
				action: function() {
					main.mode.toggleAutoTrain();
				}
			}),
			new Button({
				text: "Next Gen",
				rect: {x:50, y:100, h:35, w:190},
				action: function() {
					main.mode.nextGen();
				}
			}),
			new Button({
				text: ">",
				rect: {x:723, y:580, h:30, w:30},
				action: function() {
					let graphKeys = Object.keys(main.mode.graphList);
					let newIndex = graphKeys.indexOf(main.mode.graph.name);
					newIndex = (newIndex + 1) % graphKeys.length;
					main.mode.graph = main.mode.graphList[graphKeys[newIndex]];
				}
			}),
			new Button({
				text: "<",
				rect: {x:687, y:580, h:30, w:30},
				action: function() {
					let graphKeys = Object.keys(main.mode.graphList);
					let newIndex = graphKeys.indexOf(main.mode.graph.name);
					newIndex = (newIndex - 1 + graphKeys.length) % graphKeys.length;
					main.mode.graph = main.mode.graphList[graphKeys[newIndex]];
				}
			})
		];

		this.autoTrain = {
			state: false,		// State of autoTrain (ON or OFF)
			lastCheck: Math.floor(new Date().getTime()/1000),	// Floored second of last check date
			lastSpeed: 0,		// Speed found in last check
			lastCount: 0		// trainCount when last check was made
		}
		this.trainTime = 0;		// Number of seconds autoTraining
		this.trainCount = 0;	// Number of times for what autoTrain would call a full "train"

		// Graphing
		this.graphRect = {x:370, y:100, h:470, w:700};
		this.graphList = {
			//"Blank": new Graph("Blank", this.graphRect),
			"Best Score": new Graph("Best Score", this.graphRect),
			"Avg Score": new Graph("Avg Score", this.graphRect),
			"Master Tournament Win Rate": new Graph("Master Tournament Win Rate", this.graphRect),
			"Best Bot VS Random - Win Rate": new Graph("Best Bot VS Random - Win Rate", this.graphRect)
		};
		this.graph = this.graphList[Object.keys(this.graphList)[0]];

	}
	init() {

		this.game = new Connect4Class();		// Pendulum simulator

		this.mutateRate = 0.1;


		this.randomGamesPlayed = 10;		// Games played to calculate VS Random win rate

		//this.gamesPerBot = 8;	// Number of times game simulates each bot


		// Stores best bot from each generation
		this.bestBots = [new BotClass()];	


		this.speciesSize = 2;
		this.speciesCount = 8;
		this.speciesList = [];	// List of all species
		this.popBots = [];		// Array of all bots
		for (let i=0; i<this.speciesCount; i++) {
			let species = [];		// Singles species of bots 
			for (let j=0; j<this.speciesSize; j++) {
				let newBot = new BotClass();

				// Add bot to species list
				newBot.species = i;
				species.push(newBot);

				// Store bot in overall list of bots
				this.popBots.push(newBot);
			}
			this.speciesList.push(species);
		}


		// Store main NN
		main.testBot =  this.popBots[0];
		main.NN = main.testBot.NN;

	}
	testButtons() {		// Tests for click in any buttons throughout mode
		// Tests for clicks in buttons
		for (let i in this.buttons) {
			// If button clicked, stop checking for button presses
			if (this.buttons[i].testForClick()) break;
		}

		// Test button clicks in graph
		this.graph.testButtons();
	}
	testMouseDown() {}

	render() {

		//drawText(this.trainCount, 100, 400, 24, "black", "left");

		// AutoTrain speed
		drawText("Training at " + this.autoTrain.lastSpeed + "/sec", 50, 500, 20, "black", "left");

		// Training Time
		drawText("Trained for " + this.trainTime + " seconds", 50, 530, 20, "black", "left");

		// Render mode specific buttons
		for (let i in this.buttons) {	
			this.buttons[i].render();
		}

		// Render graph
		this.graph.render();

	}
	update() {

		// Disable autoTrain if no GAN or training data
		if (this.autoTrain.state) {
			if (main.NN == undefined) this.toggleAutoTrain();
		}

		if (this.autoTrain.state) {
			this.nextGen();
			this.trainCount ++;
		}

		let newDate = Math.floor(new Date().getTime()/1000);	// Current floored time in seconds
		if (newDate > this.autoTrain.lastCheck) {	// If one second has passed since the last check
			this.autoTrain.lastCheck = newDate;		// Set new last time for check
			this.autoTrain.lastSpeed = this.trainCount - this.autoTrain.lastCount;	// Set number of trains since last sec
			this.autoTrain.lastCount = this.trainCount;		// Store current trains to calculate speed for next second

			if (this.autoTrain.state) this.trainTime++;
		}

	}





}



/*
	A mode for training the network



	

	Generates a NN

	Makes "A" nearly identical copies

	Plays each of these copies "B" times for a maximum of "C" seconds each and adds time alive for each
	
	Find network with largest value

	Make this the new network to copy


	This is essentially hill climbing but checking multiple paths at once and picking the best one




	Should I include the original in the set of copies
	If I do, should not both re-calculating score
	If I don't, will encourage exploration more however has the chance to get worse







*/