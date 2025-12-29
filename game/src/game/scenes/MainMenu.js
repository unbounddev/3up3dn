import { Scene } from 'phaser';
import Colyseus from "colyseus.js";

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
 
        this.registry.set("client", new Colyseus.Client("http://localhost:2567"));
        let client = this.registry.get("client")
        this.add.image(512, 384, 'background');

        this.add.image(512, 300, 'logo');

        this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
          client.joinOrCreate('my_room').then(room => {
            console.log(room)
            this.registry.set("room", room);
            this.scene.start('Lobby');
          })
          .catch(e => {

          })
        });
    }
}
