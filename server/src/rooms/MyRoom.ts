import { Room, Client, AuthContext } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";

const CARDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "C", "C1", "C2"];
const STANDARD_DECK_AMOUNTS: Record<string, number> = {
  "1": 7,
  "2": 7,
  "3": 7,
  "4": 7,
  "5": 7,
  "6": 7,
  "7": 7,
  "8": 7,
  "9": 7,
  "10": 7,
  "C": 7,
  "C1": 6,
  "C2": 1,
}

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createDeck(playerCount: number) {
  const deck = [];
  const ratio = Math.ceil(playerCount / 6);
  for (let card of CARDS) {
    for (let i = 0; i < STANDARD_DECK_AMOUNTS[card]*ratio; i++){
       deck.push(card);
    }
  }
  return deck;
}

export class MyRoom extends Room<MyRoomState> {
  maxClients = 100;
  state = new MyRoomState();

  onCreate (options: any) {
    this.onMessage("start", (client, message) => {
      if (this.state.players.size < 2){
        return false;
      }
      
      this.state.draw = shuffle(createDeck(this.state.players.size));
      // deal down cards
      for (let i = 0; i < 3; i++){
        for (let player of this.state.players.values()) {
          player.down.push(this.state.draw.pop()); 
        }
      }

      // deal hand cards
      for (let i = 0; i < 6; i++){
        for (let player of this.state.players.values()) {
          player.hand.push(this.state.draw.pop()); 
        }
      }
      // console.log((this.state.players.values())[0].hand)

      // update state
      this.state.state = "SETUP";
    });
  }

  onAuth(client: Client, options: any, context: AuthContext) { 
    return this.state.state == "LOBBY";
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    player.name = `P${this.state.players.size+1}`;
    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
