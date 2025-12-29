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

      console.log(this.room.state)

      this.add.image(centerX, centerY, 'BACK').setOrigin(0.5);
      
      // deal down cards
      const downAnimations = [];
      for (let i = 0; i < 3; i++){
        for (let j = 0; j < this.room.state.players.size; j++){
          let card = this.add.image(centerX, centerY, 'BACK').setOrigin(0.5);
          downAnimations.push({
            targets: card,
            x: centerX-(card.displayWidth+(10*window.devicePixelRatio)) + (i*(card.displayWidth+(10*window.devicePixelRatio))),
            y: this.scale.height-(card.displayHeight+(10*window.devicePixelRatio)),
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
