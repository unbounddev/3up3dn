import { Scene } from 'phaser';

const CARDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'C', 'C1', 'C2'];

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
      this.client = this.registry.get("client");
      this.room = this.registry.get("room")
      this.cameras.main.setBackgroundColor(0x00512C);
      /** @type {Map<string, Phaser.GameObjects.Image[]>} */
      this.playerCards = new Map();
      /** @type {Phaser.GameObjects.Image[]} */
      this.discardCards = [];
      /** @type {Phaser.GameObjects.Image[]} */
      this.drawCards = [];
      this.selectedCards = [];
      this.selectedGraphics = [];
      const centerX = this.scale.width/2;
      const centerY = this.scale.height/2;

      /** @typedef {{ x: number, y: number }} Position */
      /** @typedef {(card: Phaser.GameObjects.Image, i: number) => Position} PositionFunc
      /** @type {{ UP: PositionFunc, RIGHT: PositionFunc, DOWN: PositionFunc, LEFT: PositionFunc}} */
      this.DOWN_POSITIONS = {
        UP: (card, i) => { 
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          const scaledWidth = card.width * newScale;
          return { 
            x: centerX-(scaledWidth+(10*window.devicePixelRatio)) + (i*(scaledWidth+(10*window.devicePixelRatio))),
            y: scaledHeight*1.5+(10*window.devicePixelRatio),
            scale: newScale
          }
        },
        RIGHT: (card, i) => { 
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          const scaledWidth = card.width * newScale;
          return { 
            x: this.scale.width-(scaledHeight*1.5+(10*window.devicePixelRatio)),
            y: centerY-(scaledWidth+(10*window.devicePixelRatio)) + (i*(scaledWidth+(10*window.devicePixelRatio))),
            angle: 270,
            scale: newScale
          }
        },
        DOWN: (card, i) => {
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          const scaledWidth = card.width * newScale;
          return { 
            x: centerX-(scaledWidth+(10*window.devicePixelRatio)) + (i*(scaledWidth+(10*window.devicePixelRatio))),
            y: this.scale.height-(scaledHeight*2+(10*window.devicePixelRatio)),
            scale: newScale 
          }
        },
        LEFT: (card, i) => { 
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          const scaledWidth = card.width * newScale;
          return { 
            x: (scaledHeight*1.5+(10*window.devicePixelRatio)),
            y: centerY-(scaledWidth+(10*window.devicePixelRatio)) + (i*(scaledWidth+(10*window.devicePixelRatio))),
            angle: 90,
            scale: newScale 
          }
        },
      }

      /** @type {{ UP: PositionFunc, RIGHT: PositionFunc, DOWN: PositionFunc, LEFT: PositionFunc}} */
      this.HAND_POS = {
        UP: (card, i) => {
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          return {
            x: centerX,
            y: (scaledHeight/2)+(5*window.devicePixelRatio),
            scale: newScale
          }
        },
        RIGHT: (card, i) => {
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          return {
            x: this.scale.width-((scaledHeight/2)+(5*window.devicePixelRatio)),
            y: centerY,
            angle: 270,
            scale: newScale 
          }
        },
        DOWN: (card, i) => {
          const newScale = 0.4;
          const scaledHeight = card.height * newScale;
          const scaledWidth = card.width * newScale;
          card.setData("flipped", true);
          return {
            x: centerX-((scaledWidth*2.5)+((10*window.devicePixelRatio)*2.5)) + (i*(scaledWidth+(10*window.devicePixelRatio))),
            y: this.scale.height-((scaledHeight/2)+(10*window.devicePixelRatio)),
            scale: newScale,
            texture: card.getData("value")
          }
        },
        LEFT: (card, i) => {
          const newScale = 0.3;
          const scaledHeight = card.height * newScale;
          return {
            x: (scaledHeight/2)+(5*window.devicePixelRatio),
            y: centerY,
            angle: 90,
            scale: newScale 
          }
        },
      }

      // create player cards
      let playerIds = Array.from(this.room.state.players.keys())
      for (let i = 0; i < playerIds.length; i++){
        let player = this.room.state.players.get(playerIds[i])
        let cards = {
          down: [],
          up: [],
          hand: []
        };
        if (this.playerCards.has(playerIds[i])){
          cards = this.playerCards.get(playerIds[i]);
        } else {
          this.playerCards.set(playerIds[i], cards);
        }
        // create down cards
        for (let j = 0; j < player.down.length; j++){
          let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5).setScale(0.4);
          card.setInteractive()
          card.setData("flipped", false);
          card.setData("value", player.down[j]);
          cards.down.push(card) 
        }
        // create hand cards 
        for (let j = 0; j < player.hand.length; j++){
          let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5).setScale(0.4);
          card.setInteractive()
          card.setData("flipped", false);
          card.setData("value", player.hand[j]);
          card.on("pointerdown", () => this.handleSelection(card))
          cards.hand.push(card) 
        }
      }

      // create draw cards 
      for (let i = 0; i < this.room.state.draw.length; i++){
        let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5).setScale(0.4);
        card.setData("flipped", false);
        card.setData("value", this.room.state.draw[i]);
        this.drawCards.push(card)
      }

      this.dealCards()

      this.input.once('pointerdown', () => {

        this.scene.start('GameOver');

      });
    }

    dealCards() {
      const visiblePlayers = this.visiblePlayers();

      let downPositions = [];
      let handPositions = [];
      switch (visiblePlayers.length) {
        case 2:
          downPositions = [this.DOWN_POSITIONS.UP, this.DOWN_POSITIONS.DOWN];
          handPositions = [this.HAND_POS.UP, this.HAND_POS.DOWN];
          break;
        case 3:
          downPositions = [this.DOWN_POSITIONS.UP, this.DOWN_POSITIONS.RIGHT, this.DOWN_POSITIONS.DOWN];
          handPositions = [this.HAND_POS.UP, this.HAND_POS.RIGHT, this.HAND_POS.DOWN];
          break;
        default:
          downPositions = [this.DOWN_POSITIONS.LEFT, this.DOWN_POSITIONS.UP, this.DOWN_POSITIONS.RIGHT, this.DOWN_POSITIONS.DOWN];
          handPositions = [this.HAND_POS.LEFT, this.HAND_POS.UP, this.HAND_POS.RIGHT, this.HAND_POS.DOWN];
      }

      const downCards = visiblePlayers.map(p => Array.from((this.playerCards.get(p)).down).sort((a, b) => CARDS.indexOf(a.getData("value")) - CARDS.indexOf(b.getData("value"))));
      const handCards = visiblePlayers.map(p => Array.from((this.playerCards.get(p)).hand).sort((a, b) => CARDS.indexOf(a.getData("value")) - CARDS.indexOf(b.getData("value"))));

      const dealAnimations = []
      
      for (let i = 0; i < 3; i++){
        for (let j = 0; j < downCards.length; j++) {
          dealAnimations.push({
            targets: downCards[j][i],
            duration: 200,
            ...downPositions[j](downCards[j][i], i)
          })
        }
      }

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < handCards.length; j++) {
          dealAnimations.push({
            targets: handCards[j][i],
            duration: 200,
            ...handPositions[j](handCards[j][i], i)
          })
        }
      }

      console.log(dealAnimations)

      this.tweens.chain({
        tweens: dealAnimations
      })

    }

    visiblePlayers() {
      // TODO: Allow player to control which players are visible
      const currentPlayer = this.room.state.currentPlayer;
      const players = Array.from(this.room.state.players.keys())
      const clientPlayer = this.room.sessionId;
      let clientIndex = players.indexOf(clientPlayer);
      const currPlayerIndex = players.indexOf(currentPlayer);
      
      if (players.length <= Object.keys(this.DOWN_POSITIONS).length) {
        if (players.length == 2 && clientIndex !== 1) {
          return players.reverse();
        } else if (clientIndex !== players.length-1) {
          const removed = players.splice(clientIndex+1);
          players.unshift(...removed);
          return players;
        } else {
          return players
        }
      }

    }
    
    /**
     * @param {Phaser.GameObjects.Image} card 
     */
    handleSelection(card) {
      let gameState = this.room.state.state;
      if (gameState == "SETUP"){
        let cardIndex = this.selectedCards.findIndex(c => c.x == card.x && c.y == card.y) 
        let rectIndex = this.selectedGraphics.findIndex(c => c.x == card.x && c.y == card.y) 
        console.log(cardIndex, rectIndex)
        if (cardIndex < 0) {
          if (this.selectedCards.length > 2) { return };
          console.log("selecting card")
          this.selectedCards.push(card)
          let rectangle = this.add.rectangle(card.x, card.y, card.displayWidth+4*window.devicePixelRatio, card.displayHeight+4*window.devicePixelRatio);
          rectangle.setStrokeStyle(4*window.devicePixelRatio, 0xff0000);
          this.selectedGraphics.push(rectangle);
        } else {
          console.log("deselecting card");
          this.selectedCards.splice(cardIndex, 1);
          if (rectIndex >= 0){
            console.log("remove rectangle")
            let rect = this.selectedGraphics.splice(rectIndex, 1)[0];
            rect.destroy();
            rect = null;
          }
        }
      }
    }

}
