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

  "Squares": "85 0 128 0 128 0 128 0",
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
  pc.width = 8 * options.zoom;
  pc.height = options.pattern.length * options.zoom;

  const pctx = pc.getContext("2d");
  pctx.scale(1, 1);
  pctx.fillStyle = options.backColor;
  pctx.fillRect(0, 0, 1, 1);
  const bg = pctx.getImageData(0, 0, 1, 1).data;

  const id = pctx.createImageData(pc.width, pc.height);
  for (let y = 0; y < options.pattern.length; y++) {
    for (let x = 0; x < 8; x++) {
      let r, g, b, a = 255;

      const pb = options.invert ? ~options.pattern[y] : options.pattern[y];
      if (pb & (1 << x)) {
        r = 0;
        g = 0;
        b = 0;
      } else {
        r = bg[0];
        g = bg[1];
        b = bg[2];
      }

      for (let zy = 0; zy < options.zoom; zy++) {
        for (let zx = 0; zx < options.zoom; zx++) {
          const idx = ((y * options.zoom + zy) * 8 * options.zoom + (x * options.zoom + zx)) * 4;
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
  ctx.scale(1, 1);
  const cpat = ctx.createPattern(pc, "repeat");
  ctx.fillStyle = cpat;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function save() {
  const sel = document.getElementById("pattern");
  const picker = document.getElementById("picker");
  const zoom = document.getElementById("zoom");
  const invert = document.getElementById("invert");
  const config = document.getElementById("config");

  const words = sel.value.split(' ');
  const bytes = words.map(x => parseInt(x));
  const options = invert.checked ? "i" : "";

  config.value = btoa(String.fromCharCode(...new Uint8Array(bytes))) + "," + picker.value + "," + zoom.value + "," + options;
  return {
    pattern: bytes,
    backColor: picker.value,
    zoom: parseInt(zoom.value),
    invert: invert.checked,
  };
}

function load() {
  const sel = document.getElementById("pattern");
  const picker = document.getElementById("picker");
  const zoom = document.getElementById("zoom");
  const invert = document.getElementById("invert");
  const config = document.getElementById("config");

  const values = config.value.split(",");
  const bytes = new Uint8Array([...atob(values[0])].map(char => char.charCodeAt(0)));

  const options = {
    pattern: bytes,
    backColor: values[1],
    zoom: parseInt(values[2]),
    invert: values[3].includes("i"),
  };
  sel.value = bytes.join(" ");
  picker.value = options.backColor;
  zoom.value = options.zoom;
  invert.checked = options.invert;
  return options;
}

window.addEventListener("DOMContentLoaded", () => {
  loadPatterns();
  window.addEventListener("resize", () => {
    render(load());
  });
  document.querySelectorAll(".control").forEach(x => x.addEventListener("change", () => {
    render(save());
  }));
  document.getElementById("config").addEventListener("keydown", ev => {
    if (ev.key == "Enter") {
      render(load());
    }
  });
  document.getElementById("config").addEventListener("focus", () => {
    document.getElementById("config").select();
  });
  render(save());
});
