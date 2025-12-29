import { Schema, MapSchema, ArraySchema ,type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string = "";
  @type({ array: "string" }) up: string[] = new ArraySchema<string>();
  @type({ array: "string" }) down: string[] = new ArraySchema<string>();
  @type({ array: "string" }) hand: string[] = new ArraySchema<string>();
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") state = "LOBBY";
  @type({ array: "string" }) draw: string[] = new ArraySchema<string>();
  @type({ array: "string" }) discard: string[] = new ArraySchema<string>();
}
