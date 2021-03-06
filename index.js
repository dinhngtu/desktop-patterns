const patterns = {
  "Bricks": "187 95 174 93 186 117 234 245",
  "Buttons": "170 125 198 71 198 127 190 85",
  "Cargo Net": "120 49 19 135 225 200 140 30",
  "Circuits": "82 41 132 66 148 41 66 132",
  "Cobblestones": "40 68 146 171 214 108 56 16",
  "Colosseum": "130 1 1 1 171 85 170 85",
  "Daisies": "30 140 216 253 191 27 49 120",
  "Dizzy": "62 7 225 7 62 112 195 112",
  "Field Effect": "86 89 166 154 101 149 106 169",
  "Key": "254 2 250 138 186 162 190 128",
  "Live Wire": "239 239 14 254 254 254 224 239",
  "Plaid": "240 240 240 240 170 85 170 85",
  "Rounder": "215 147 40 215 40 147 213 215",
  "Scales": "225 42 37 146 85 152 62 247",
  "Stone": "174 77 239 255 8 77 174 77",
  "Thatches": "248 116 34 71 143 23 34 113",
  "Tile": "69 130 1 0 1 130 69 170",
  "Triangles": "135 7 6 4 0 247 231 199",
  "Waffle's Revenge": "77 154 8 85 239 154 77 154",

  "50% Gray": "170 85 170 85 170 85 170 85",
  "Boxes": "127 65 65 65 65 65 127 0",
  "Critters": "0 80 114 32 0 5 39 2",
  "Diamonds": "32 80 136 80 32 0 0 0",
  "Paisley": "2 7 7 2 32 80 80 32",
  "Pattern": "224 128 142 136 234 10 14 0",
  "Quilt": "130 68 40 17 40 68 130 1",
  "Scottie": "64 192 200 120 120 72 0 0",
  "Spinner": "20 12 200 121 158 19 48 40",
  "Thatches": "248 116 34 71 143 23 34 113",
  "Tulip": "0 0 84 124 124 56 146 124",
  "Waffle": "0 0 0 0 128 128 128 240",
  "Weave": "136 84 34 69 136 21 34 81",
};

function loadPatterns() {
  const sel = document.getElementById("pattern");
  for (const [name, value] of Object.entries(patterns)) {
    const el = document.createElement("option");
    el.label = name;
    el.value = value;
    sel.appendChild(el);
  }
}

function createPattern(options) {
  const pc = document.createElement("canvas");
  pc.width = options.bpc * options.zoom;
  pc.height = options.pattern.length * options.zoom;

  const pctx = pc.getContext("2d");
  pctx.fillStyle = options.color;
  pctx.fillRect(0, 0, 1, 1);
  const fg = pctx.getImageData(0, 0, 1, 1).data;

  pctx.fillStyle = options.backColor;
  pctx.fillRect(0, 0, 1, 1);
  const bg = pctx.getImageData(0, 0, 1, 1).data;

  const id = pctx.createImageData(pc.width, pc.height);
  for (let y = 0; y < options.pattern.length; y++) {
    for (let x = 0; x < options.bpc; x++) {
      let r, g, b, a = 255;

      if (options.pattern[y] & (1 << x)) {
        r = fg[0];
        g = fg[1];
        b = fg[2];
      } else {
        r = bg[0];
        g = bg[1];
        b = bg[2];
      }

      for (let zy = 0; zy < options.zoom; zy++) {
        for (let zx = 0; zx < options.zoom; zx++) {
          const idx = ((y * options.zoom + zy) * options.bpc * options.zoom + (x * options.zoom + zx)) * 4;
          id.data[idx] = r;
          id.data[idx + 1] = g;
          id.data[idx + 2] = b;
          id.data[idx + 3] = a;
        }
      }
    }
  }
  pctx.putImageData(id, 0, 0);
  return pc;
}

function render(options) {
  const wrapper = document.getElementById("wrapper");
  const canvas = document.getElementById("canvas");
  canvas.width = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;

  const pc = createPattern(options);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cpat = ctx.createPattern(pc, "repeat");
  ctx.fillStyle = cpat;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function save(options) {
  if (!options) {
    const sel = document.getElementById("pattern");
    const fg = document.getElementById("fg");
    const bg = document.getElementById("bg");
    const bpc = document.getElementById("bpc");
    const zoom = document.getElementById("zoom");
    const config = document.getElementById("config");

    const words = sel.value.split(' ');
    const bytes = words.map(x => parseInt(x));

    options = {
      pattern: sel.value ? bytes : JSON.parse(config.value).pattern,
      color: fg.value,
      backColor: bg.value,
      bpc: parseInt(bpc.value),
      zoom: parseInt(zoom.value),
    };
  }
  config.value = JSON.stringify(options);
  return options;
}

function load() {
  const sel = document.getElementById("pattern");
  const fg = document.getElementById("fg");
  const bg = document.getElementById("bg");
  const bpc = document.getElementById("bpc");
  const zoom = document.getElementById("zoom");
  const config = document.getElementById("config");

  const options = JSON.parse(config.value);
  sel.value = options.pattern.map(x => x.toString()).join(" ");
  fg.value = options.color;
  bg.value = options.backColor;
  bpc.value = options.bpc;
  zoom.value = options.zoom;
  return options;
}

function draw(cx, cy) {
  const options = load();
  const x = Math.floor(cx / options.zoom) % options.bpc;
  const y = Math.floor(cy / options.zoom) % options.pattern.length;
  options.pattern[y] = options.pattern[y] ^ (1 << x);
  render(save(options));
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    const wrapper = document.getElementById("wrapper");
    wrapper.requestFullscreen({
      navigationUI: "hide"
    }).then(() => {
      render(load());
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadPatterns();

  const fg = document.getElementById("fg");
  const bg = document.getElementById("bg");
  const swap = document.getElementById("swap");
  const config = document.getElementById("config");
  const canvas = document.getElementById("canvas");
  const pencil = document.getElementById("pencil");
  const fullscreen = document.getElementById("fullscreen");
  window.addEventListener("resize", () => render(load()));
  document.querySelectorAll(".control").forEach(x => x.addEventListener("change", () => render(save())));
  swap.addEventListener("click", () => {
    const tmp = fg.value;
    fg.value = bg.value;
    bg.value = tmp;
    render(save());
  });
  config.addEventListener("keydown", ev => {
    if (ev.key == "Enter") {
      render(load());
    }
  });
  config.addEventListener("focus", () => config.select());
  canvas.addEventListener("click", ev => {
    if (pencil.checked) {
      const cp = canvas.getBoundingClientRect()
      draw(ev.clientX - cp.left, ev.clientY - cp.top);
    }
  });
  fullscreen.addEventListener("click", () => toggleFullscreen());
  canvas.addEventListener("dblclick", () => {
    if (!pencil.checked) {
      toggleFullscreen();
    }
  });
  render(save());
});
