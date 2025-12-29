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
        localStorage.setItem("server-url", localStorage.getItem("server-url") || "http://localhost:2567");
        /** @type {HTMLDivElement} */
        const serverSettingsModal = document.getElementById("server-settings-modal");
        /** @type {HTMLFormElement} */
        const serverSettingsForm = document.getElementById("server-settings-form");
        /** @type {HTMLInputElement} */
        const serverSettingsUrl = document.getElementById("server-settings-url");


        this.signal = this.add.image(this.scale.width*0.9, this.scale.height*0.1, 'signal').setOrigin(0.5)
        this.signal.setInteractive()
        this.noSignal = this.add.image(this.scale.width*0.9, this.scale.height*0.1, 'x').setOrigin(0.5).setVisible(false)

        const joinBtn = this.add.rectangle(this.scale.width/2, this.scale.height/2, 200, 40, 0xffffff).setOrigin(0.5)
        const joinText = this.add.text(this.scale.width/2, this.scale.height/2, 'Join', {
            fontFamily: 'sans-serif', fontSize: 38, color: '#000000',
            align: 'center'
        }).setOrigin(0.5);
        joinBtn.setDisplaySize(joinText.displayWidth+40, joinText.displayHeight+10)
        joinBtn.setInteractive()
        
        this.updateClient()

        joinBtn.on('pointerdown', () => {
          this.client.joinOrCreate('my_room').then(room => {
            console.log(room)
            this.registry.set("room", room);
            this.scene.start('Lobby');
          })
          .catch(e => {

          })
        });

        this.signal.on('pointerdown', () => {
          serverSettingsUrl.value = localStorage.getItem("server-url"); 
          serverSettingsModal.classList.add("visible");
        })

        serverSettingsForm.addEventListener("submit", (e) => {
          e.preventDefault() 
          const formData = new FormData(e.target);
          const url = formData.get("url").trim();
          if (url) {
            localStorage.setItem("server-url", url);
            this.updateClient()
            serverSettingsModal.classList.remove("visible");
          }
        })
    }

    updateClient() {
      this.registry.set("client", new Colyseus.Client(localStorage.getItem("server-url")));
      this.client = this.registry.get("client")
      this.client.http.get('/status').then(r => { this.noSignal.setVisible(false) }).catch(e => { this.noSignal.setVisible(true) })
    }
}
