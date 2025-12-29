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
      this.cameras.main.setBackgroundColor(0x00ff00);
      this.state = null;

      console.log(this.room.state)

      this.add.image(512, 384, 'background').setAlpha(0.5);
      this.add.image(this.scale.width/2, this.scale.height/2, 'BACK').setOrigin(0.5);

        for (let i = 0; i < 3; i++){
          for (let j = 0; j < this.room.state.players.size; j++){
            let card = this.add.image(this.scale.width/2, this.scale.height/2, 'BACK').setOrigin(0.5);
            this.tweens.add({
              targets: card,
              x: this.scale.width/2-160 + (i*160),
              y: this.scale.height-210
            })
          }
        }

      this.room.onStateChange(state => {
        console.log(state)
        this.state = state;
      })

      this.input.once('pointerdown', () => {

        this.scene.start('GameOver');

      });
    }

}
