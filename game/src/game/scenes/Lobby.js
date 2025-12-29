import { Scene } from 'phaser';
import { getStateCallbacks } from "colyseus.js";

export class Lobby extends Scene
{
    constructor ()
    {
        super('Lobby');
    }

    create ()
    {
      this.client = this.registry.get("client");
      this.room = this.registry.get("room")
      this.cameras.main.setBackgroundColor(0x00ff00);
      this.state = null;
      this.$ = getStateCallbacks(this.room);

      this.playersJoined = this.add.text(this.scale.width/2, this.scale.height/2, `${0} have joined`, {
        fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', align: 'center'
      }).setOrigin(0.5)


      this.room.onStateChange.once(state => {
        this.state = state;
        this.updatePlayersJoined();
      })

      this.room.onStateChange(state => {
        this.state = state;
        this.updatePlayersJoined();
      })

      this.$(this.room.state).listen("state", (currentValue) => {
        if (currentValue == "SETUP") {
          this.scene.start("Game");
        }
      })

      this.input.on('pointerdown', () => {
        this.room.send("start");

      });
    }

    updatePlayersJoined() {
      this.playersJoined.setText(`${this.state.players.size} have joined`) 
    }
}
