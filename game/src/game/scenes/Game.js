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
      const displayCard = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5);

      /** @typedef {{ x: number, y: number }} Position */
      /** @typedef {(card: Phaser.GameObjects.Image, i: number) => Position} PositionFunc
      /** @type {PositionFunc[]} */
      const DOWN_POSITIONS = [
        (card, i) => ({ 
          x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: card.displayHeight+(10*window.devicePixelRatio)
        }),
        (card, i) => ({ 
          x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: this.scale.height-(card.displayHeight+(10*window.devicePixelRatio))
        }),
        (card, i) => ({ 
          x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: this.scale.height-(card.displayHeight+(10*window.devicePixelRatio))
        }),
        (card, i) => ({ 
          x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
          y: this.scale.height-(card.displayHeight+(10*window.devicePixelRatio))
        }),
      ]

      console.log(this.room.state)

      
      // deal down cards
      const downAnimations = [];
      /** @type {PositionFunc[]} */
      let downPositions = [];
      if (this.room.state.players.size == 2){
        downPositions = [DOWN_POSITIONS[0], DOWN_POSITIONS[2]]
      }
      for (let i = 0; i < 3; i++){
        for (let j = 0; j < this.room.state.players.size; j++){
          let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5);
          const pos = downPositions[j](card, i);
          downAnimations.push({
            targets: card,
            x: pos.x,
            y: pos.y,
            duration: 200
          })
        }
      }
      this.tweens.chain({
        tweens: downAnimations
      })

      this.room.onStateChange(state => {
        console.log(state)
        this.state = state;
      })

      this.input.once('pointerdown', () => {

        this.scene.start('GameOver');

      });
    }

}
