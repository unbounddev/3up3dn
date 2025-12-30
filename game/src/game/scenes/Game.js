import { Scene } from 'phaser';

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
      this.state = this.room.state;
      const centerX = this.scale.width/2;
      const centerY = this.scale.height/2;
      const displayCard = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5).setScale(0.4);

      /** @typedef {{ x: number, y: number }} Position */
      /** @typedef {(card: Phaser.GameObjects.Image, i: number) => Position} PositionFunc
      /** @type {PositionFunc[]} */
      const DOWN_POSITIONS = [
        (card, i) => ({ 
          x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: card.displayHeight*1.5+(10*window.devicePixelRatio)
        }),
        (card, i) => ({ 
          x: this.scale.width-(card.displayHeight*1.5+(10*window.devicePixelRatio)),
          y: centerY-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          angle: 270 
        }),
        (card, i) => ({ 
          x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: this.scale.height-(card.displayHeight*2+(10*window.devicePixelRatio))
        }),
        (card, i) => ({ 
          x: (card.displayHeight*1.5+(10*window.devicePixelRatio)),
          y: centerY-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          angle: 90
        }),
      ]

      /** @type {PositionFunc[]} */
      const HAND_POS = [
        (card, i) => ({
          x: centerX,
          y: (card.displayHeight/2)+(5*window.devicePixelRatio)
        }),
        (card, i) => ({
          x: this.scale.width-((card.displayHeight/2)+(5*window.devicePixelRatio)),
          y: centerY,
          angle: 270
        }),
        (card, i) => ({
          x: centerX-((card.displayWidth*2.5)+((10*window.devicePixelRatio)*2.5)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: this.scale.height-((card.displayHeight/2)+(10*window.devicePixelRatio))
        }),
        (card, i) => ({
          x: (card.displayHeight/2)+(5*window.devicePixelRatio),
          y: centerY,
          angle: 90
        }),
      ]
      
      // deal down cards
      /** @type {Phaser.Types.Tweens.TweenBuilderConfig[]} */
      const dealAnimations = [];
      /** @type {PositionFunc[]} */
      let downPositions = [];
      if (this.room.state.players.size == 2){
        downPositions = [DOWN_POSITIONS[0], DOWN_POSITIONS[2]]
      } else {
        downPositions = DOWN_POSITIONS
      }
      for (let i = 0; i < 3; i++){
        for (let j = 0; j < this.room.state.players.size; j++){
          let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5).setScale(0.3);
          console.log(card.angle)
          const pos = downPositions[j](card, i);
          dealAnimations.push({
            targets: card,
            ...pos,
            duration: 200
          })
        }
      }

      // deal hand
      /** @type {PositionFunc[]} */
      let handPositions = [];
      if (this.room.state.players.size == 2){
        handPositions = [HAND_POS[0], HAND_POS[2]]
      } else {
        handPositions = HAND_POS
      }
      for (let i = 0; i < 6; i++){
        for (let j = 0; j < this.room.state.players.size; j++){
          let isCurrPlayer = this.room.state.players.size > 2 && j == 2 ? true : this.room.state.players.size < 3 && j == 1 ? 1 : false;
          let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5).setScale(isCurrPlayer ? 0.4 : 0.3);
          const pos = handPositions[j](card, i);
          dealAnimations.push({
            targets: card,
            ...pos,
            duration: 200
          })
        }
      }
      this.tweens.chain({
        tweens: dealAnimations
      })

      this.room.onStateChange(state => {
        this.state = state;
      })

      this.input.once('pointerdown', () => {

        this.scene.start('GameOver');

      });
    }

}
