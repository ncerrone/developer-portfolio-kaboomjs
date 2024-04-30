import { kaboomContext } from "./kaboomCtx";
import { scaleFactor } from "./constants";
import { displayDialog } from "./utils";

kaboomContext.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 }
  }
});

kaboomContext.loadSprite("map", "./map.png");
kaboomContext.setBackground(kaboomContext.Color.fromHex("#311047"));

kaboomContext.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = kaboomContext.add([
    kaboomContext.sprite("map"),
    kaboomContext.pos(0),
    kaboomContext.scale(scaleFactor)
  ]);

  const player = kaboomContext.make([
    kaboomContext.sprite("spritesheet", { anim: "idle-down" }),
    kaboomContext.area({
      shape: new kaboomContext.Rect(kaboomContext.vec2(0, 3), 10, 10)
    }),
    kaboomContext.body(),
    kaboomContext.anchor("center"),
    kaboomContext.pos(),
    kaboomContext.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player"
  ]);

  for (const layer of layers) {
    if (layer.name === 'boundaries') {
      for (const boundary of layer.objects) {
        map.add([
          kaboomContext.area({
            shape: new kaboomContext.Rect(kaboomContext.vec2(0), boundary.width, boundary.height),
          }),
          kaboomContext.body({ isStatic: true }),
          kaboomContext.pos(boundary.x, boundary.y),
          boundary.name
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialog("TODO", () => player.isInDialogue = false);
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = kaboomContext.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          kaboomContext.add(player);
          continue;
        }
      }
    }
  }

  kaboomContext.onUpdate(() => {
    kaboomContext.camPos(player.pos.x, player.pos.y + 100);
  });
});

kaboomContext.go("main");

