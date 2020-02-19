PIXI.utils.sayHello();

const Application = PIXI.Application;
const loader = PIXI.loader;
const resources = PIXI.loader.resources;
const Sprite = PIXI.Sprite;

const root = new Application({
  backgroundColor: 0x1099bb,
  width: window.screen.width,
  height: 195,
});

document.body.appendChild(root.view);

const REEL_WIDTH = 80;
const IMG_SIZE = 65;

loader
  .add(['images/M00_000.jpg', 'images/M01_000.jpg', 'images/M02_000.jpg',
    'images/M03_000.jpg', 'images/M04_000.jpg', 'images/M05_000.jpg',
    'images/M06_000.jpg', 'images/M07_000.jpg', 'images/M08_000.jpg',
    'images/M09_000.jpg', 'images/M10_000.jpg', 'images/M11_000.jpg', 'images/M12_000.jpg'])
  .load(loadPictures);

function loadPictures() {
  const slotTextures = [
    PIXI.Texture.from('images/M00_000.jpg'),
    PIXI.Texture.from('images/M01_000.jpg'),
    PIXI.Texture.from('images/M02_000.jpg'),
    PIXI.Texture.from('images/M03_000.jpg'),
    PIXI.Texture.from('images/M04_000.jpg'),
    PIXI.Texture.from('images/M05_000.jpg'),
    PIXI.Texture.from('images/M06_000.jpg'),
    PIXI.Texture.from('images/M07_000.jpg'),
    PIXI.Texture.from('images/M08_000.jpg'),
    PIXI.Texture.from('images/M09_000.jpg'),
    PIXI.Texture.from('images/M10_000.jpg'),
    PIXI.Texture.from('images/M11_000.jpg'),
    PIXI.Texture.from('images/M12_000.jpg'),
  ];

  const reels = [];

  const reelContainer = new PIXI.Container();

  for (let i = 0; i < 5; i++) {
    const item = new PIXI.Container();

    item.x = REEL_WIDTH * i;
    reelContainer.addChild(item);

    const reel = {
      container: item,
      symbols: [],
      position: 0,
      previousPosition: 0,
      blur: new PIXI.filters.BlurFilter(),
    };

    reel.blur.blurX = 0;
    reel.blur.blurY = 0;
    item.filters = [reel.blur];

    for (let j = 0; j < 14; j++) {
      const symbol = new Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);

      symbol.y = j * IMG_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(IMG_SIZE / symbol.width, IMG_SIZE / symbol.height);
      reel.symbols.push(symbol);
      item.addChild(symbol);
    }
    reels.push(reel);
  }

  root.stage.addChild(reelContainer);

  const margin = (root.screen.height - IMG_SIZE * 3);

  reelContainer.y = margin;
  reelContainer.x = root.screen.width / 2 - reelContainer.width / 2;

  const button = new PIXI.Graphics();

  button.beginFill(0, 1);
  button.drawRect(0, IMG_SIZE * 3 + margin, root.screen.width, margin);

  const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#20c5ff'], // gradient
    stroke: '#11296d',
    strokeThickness: 5,
  });

  const playText = new PIXI.Text('Spin', style);

  playText.x = Math.round(button.width - playText.width * 5);
  playText.y = root.screen.height / 2 - playText.width / 2;
  button.addChild(playText);

  root.stage.addChild(button);

  button.interactive = true;
  button.buttonMode = true;

  button.addListener('click', () => {
    start();
  });

  let active = false;

  function start() {
    if (active) {
      return;
    }
    active = true;

    for (let i = 0; i < reels.length; i++) {
      const rl = reels[i];
      const extra = Math.floor(Math.random() * 5);
      const target = rl.position + 10 + i * 5 + extra;
      const time = 2500 + i * 600 + extra * 600;

      tweenTo(
        rl,
        'position',
        target, time, backout(0.5),
        null,
        i === reels.length - 1 ? reelsComplete : null
      );
    }

    function reelsComplete() {
      active = false;
    }

    root.ticker.add(() => {
      for (let i = 0; i < reels.length; i++) {
        const rl = reels[i];

        rl.blur.blurY = (rl.position - rl.previousPosition) * 8;
        rl.previousPosition = rl.position;

        for (let j = 0; j < rl.symbols.length; j++) {
          const s = rl.symbols[j];
          const prev = s.y;

          s.y = ((rl.position + j) % rl.symbols.length) * IMG_SIZE - IMG_SIZE;

          if (s.y < 0 && prev > IMG_SIZE) {
            s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.x = s.scale.y = Math.min(IMG_SIZE / s.texture.width, IMG_SIZE / s.texture.height);
            s.x = Math.round((IMG_SIZE - s.width) / 2);
          }
        }
      }
    });
  }
}

const tweening = [];

function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
  const tween = {
    object,
    property,
    propertyBeginValue: object[property],
    target,
    easing,
    time,
    change: onchange,
    complete: oncomplete,
    start: Date.now(),
  };

  tweening.push(tween);

  return tween;
}

root.ticker.add(() => {
  const now = Date.now();
  const remove = [];

  for (let i = 0; i < tweening.length; i++) {
    const t = tweening[i];
    const phase = Math.min(1, (now - t.start) / t.time);

    t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));

    if (t.change) {
      t.change(t);
    }

    if (phase === 1) {
      t.object[t.property] = t.target;

      if (t.complete) {
        t.complete(t);
      }
      remove.push(t);
    }
  }

  for (let i = 0; i < remove.length; i++) {
    tweening.splice(tweening.indexOf(remove[i]), 1);
  }
});

function lerp(a1, a2, t) {
  return a1 * (1 - t) + a2 * t;
}

function backout(amount) {
  return t => (--t * t * ((amount + 1) * t + amount) + 1);
}
