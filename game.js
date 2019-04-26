window.onload = function() {	
    var tileWidth = 85;
    var tileHeight = 87;
    var numRows = 3;
    var numCols = 6; 
    var tileSpacing = 10;  
    var tilesArray = [];
    var selectedArray = [];
    var playSound;
    var score;
    var timeLeft;

    var game = new Phaser.Game(610, 361); // Each tile is 85 x 87h
    
	var playGame = function(game){}
	playGame.prototype = {
        scoreText: null,
        timeText: null,
        // Array to store sounds
        soundArray: [],
        preload: function() {
            
            // Preload the sprite sheet
            game.load.spritesheet("tiles", "tiles_half_hive.png", tileWidth, tileHeight);

            // Preoload sounds
            game.load.audio('select', ['select.mp3', 'select.ogg']);
            game.load.audio('right', ['right.mp3', 'right.ogg']);
            game.load.audio('wrong', ['wrong.mp3', 'wrong.ogg']);

           /*  // Preoload custom text...get this to work later
            game.load.bitmapFont('mario', 'font.png', 'font.fnt'); */
           },
		create: function(){
            // New game, set score to zero
            score = 0; 
            // Reset timer when new game is created
            timeLeft = 30;
             // Add symbol images, ie. build the grid
            this.placeTiles();
            if(playSound) {
                this.soundArray[0] = game.add.audio('select', 1);
                this.soundArray[1] = game.add.audio('right', 1);
                this.soundArray[2] = game.add.audio('wrong', 1);
            }
            this.scoreText = game.add.text(5, 5, 'Score: ' + score,
            { font: '18px Arial', fill: '#ffffff' });

            this.timeText = game.add.text(game.width - 5, 5, "Time left: " + timeLeft,
            { font: '18px Arial', fill: '#ffffff' });
            this.timeText.anchor.set(1, 0);
            game.time.events.loop(Phaser.Timer.SECOND, this.decreaseTime, this);
        },
        decreaseTime: function() {
            timeLeft--;
            this.timeText.text = "Time left: " + timeLeft;
            if(timeLeft == 0) {
                game.state.start("GameOver");
            }
        },
        placeTiles: function() { // Place all game tiles
            // Subtract the length of all     all tiles             all empty spaces               divide by 2
            var leftSpace = (game.width - (numCols * tileHeight) - ((numCols - 1) * tileSpacing )) / 2;
            var topSpace = (game.height - (numRows * tileWidth) - ((numRows -1)  * tileSpacing)) / 2;

            // Populate the tilesArray and assign a custom property from 0-8
            for(var i = 0; i < numRows * numCols; i++) {
                tilesArray.push(Math.floor(i / 2));
            }
            // Shuffle tilesArray
            for(i = 0; i < numRows * numCols; i++) {
                var from = game.rnd.between(0, tilesArray.length - 1);
                var to = game.rnd.between(0, tilesArray.length - 1);
                var temp = tilesArray[from];
                tilesArray[from] = tilesArray[to];
                tilesArray[to] = temp;
            }
            console.log("my tile values: " + tilesArray);            
            
            // Build game grid
            for(i = 0; i < numCols; i++) {
                for(var j = 0; j < numRows; j++) { 
                    // Turn an image into an interactive element (a button)
                    var tile = game.add.button(leftSpace + i * (tileHeight + tileSpacing), 
                    topSpace + j * (tileWidth + tileSpacing), "tiles",
                    this.showTile, this);

                    // Face down tiles to start with
                    tile.frame = 9;
                    tile.value = tilesArray[j * numCols + i];
                }
            }
        },
        showTile: function(target) {
            // If two tiles not chosen and array doesn't contain the current selected tile
            if(selectedArray.length < 2 && selectedArray.indexOf(target) == -1) {
                if(playSound) {
                    this.soundArray[0].play();
                }
                //console.log("This tile has value =  " + target.value);
                target.frame = target.value;
                selectedArray.push(target);
                // THIS IF STATEMENT NEEDS TO BE NESTED IN THE FIRST ONE. WHY? Basically saying that if array is less than 2, then becomes 2 do the following
                if(selectedArray.length == 2) {
                    game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);                
                }
            }            
        },
        checkTiles: function() {
            // If tiles match destroy them
            if(selectedArray[0].value == selectedArray[1].value) {
                if(playSound) {
                    this.soundArray[1].play();
                }
                // Add 1 to score
                score++;
                // Update the score
                this.scoreText.text = "Score: " + score;

                selectedArray[0].destroy();
                selectedArray[1].destroy();
            }
            else {
                if(playSound) {
                    this.soundArray[2].play();
                }
                // If the tiles don't match turn face down
                selectedArray[0].frame = 9;
                selectedArray[1].frame = 9;
            }
            // Empty array so player can select new pair of tiles
            selectedArray.length = 0;
        }
    } //--- playGame END

    var titleScreen = function(game) {}
    titleScreen.prototype = {
        preload: function() {
            // Preload title screen image
            game.load.image('titleScreen', 'logo-flowers.png');
            // Preload sound icons
            game.load.spritesheet('soundicons', 'soundicons-2.png', 100, 103);
            },
        create: function() {
            game.stage.disableVisibilityChange = true;
            // Add stage colour
            game.stage.backgroundColor = "#dbc3c1";
            // Add title screen image
            this.background = game.add.tileSprite(0, 0, 610, 361, 'titleScreen');

            // Add sound buttons
            var soundButtonOff = game.add.button(game.width - 100, game.height / 2 - 100, 'soundicons', this.startGame, this);
            var soundButtonOn = game.add.button(game.width - 100, game.height / 2 + 20, 'soundicons', this.startGame, this);
            soundButtonOff.frame = 1;
            soundButtonOff.anchor.set(0);
            soundButtonOn.frame = 0;
            soundButtonOn.anchor.set(0);
        },
        startGame: function(target) {
            if(target.frame == 0) {
            playSound = true;
            }
            else {
                playSound = false;
            }
            game.state.start("PlayGame");
        }
    } //--- titleScreen END

    var gameOver =function(){}
    gameOver.prototype = {
        create: function() {
            var text = game.add.text(game.width / 2, game.height / 2, 
            'Game Over\n\nYour score: ' + score + '\n\nTap to restart',
            { font:'18px Arial', fill: '#ffffff'});
            text.anchor.set(0.5);
            game.input.onDown.add(this.restartGame, this);
        },
        restartGame: function() {
            tilesArray.length = 0;
            selectedArray.length = 0;
            game.state.start("TitleScreen");
        }
    }

     // Add states to be used in the game
    game.state.add("PlayGame", playGame);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("GameOver", gameOver);
    // Start the state
    game.state.start("TitleScreen");
} 