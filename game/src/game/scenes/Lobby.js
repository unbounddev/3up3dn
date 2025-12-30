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
      this.cameras.main.setBackgroundColor(0x00512C);
      this.state = this.room.state;
      this.$ = getStateCallbacks(this.room);
      console.log(this.room.state)

      this.playersJoined = this.add.text(this.scale.width/2, this.scale.height/2, `${this.room.state.players ? this.room.state.players.size : 0} have joined`, {
        fontFamily: 'sans-serif', fontSize: 24*window.devicePixelRatio, color: '#ffffff', align: 'center'
      }).setOrigin(0.5)

      const startBtn = this.add.rectangle(this.scale.width/2, this.scale.height/2, 200*window.devicePixelRatio, 40*window.devicePixelRatio, 0xffffff).setOrigin(0.5)
      const startText = this.add.text(this.scale.width/2, this.scale.height/2, 'Start', {
        fontFamily: 'sans-serif', 
        fontSize: 24*window.devicePixelRatio, 
        color: '#000000', 
        align: 'center'
      }).setOrigin(0.5);
      startBtn.setDisplaySize(startText.displayWidth+40*window.devicePixelRatio, startText.displayHeight+10*window.devicePixelRatio)
      startBtn.setPosition(
        this.scale.width/2, 
        (this.scale.height/2) + this.playersJoined.displayHeight + (10*window.devicePixelRatio) + (startBtn.displayHeight/2))
      startText.setPosition(this.scale.width/2, (this.scale.height/2) + this.playersJoined.displayHeight + (10*window.devicePixelRatio) + (startBtn.displayHeight/2))
      startBtn.setInteractive()
        
      startBtn.on('pointerdown', () => {
        this.room.send("start");
      });

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

    }

    updatePlayersJoined() {
      this.playersJoined.setText(`${this.state.players.size} have joined`) 
    }
}
