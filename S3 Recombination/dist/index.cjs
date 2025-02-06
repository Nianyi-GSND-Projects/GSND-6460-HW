// src/p5.mts
var p5_default = p5;

// src/app.mts
function WaitUntil(fn) {
  return new Promise((res) => {
    const timerId = setInterval(() => {
      if (!fn())
        return;
      clearInterval(timerId);
      res();
    });
  });
}
function SetupRadioList($list, options, optionGenerator) {
  const $options = Array.from(options).map(optionGenerator);
  $options[0].querySelector('input[type="radio"]').setAttribute("checked", "");
  $list.append(...$options);
}
var MakeRadioOption = (name) => (components) => {
  if (!(Symbol.iterator in components))
    components = [components];
  const component = components[0];
  const $fragment = document.createDocumentFragment();
  const $radio = document.createElement("input");
  $radio.type = "radio";
  $radio.name = name;
  $radio.value = component.name;
  $radio.id = `${$radio.name}-${$radio.value}`;
  $fragment.append($radio);
  const $label = document.createElement("label");
  $label.setAttribute("for", $radio.id);
  $fragment.append($label);
  for (const component2 of components) {
    const $img = document.createElement("img");
    $img.src = `component/${component2.type}/${component2.name}.png`;
    $label.append($img);
  }
  return $fragment;
};
var App = class {
  #$settings;
  #ready = false;
  #invalidated = true;
  #components = /* @__PURE__ */ new Map();
  /* Construction and initialization */
  //#region
  async Initialize() {
    await this.#FetchResources();
    this.#SetupUi();
    this.#ready = true;
  }
  async #FetchResources() {
    const components = await (await fetch("components.json")).json();
    const imageLoaders = [];
    for (const component of components) {
      component.url = `component/${component.type}/${component.name}.png`;
      imageLoaders.push(new Promise((res, rej) => {
        component.image = loadImage(component.url, () => res(), (err) => rej(err));
      }));
      const type = component.type;
      if (!this.#components.has(type))
        this.#components.set(type, /* @__PURE__ */ new Map());
      this.#components.get(type).set(component.name, component);
    }
    await Promise.allSettled(imageLoaders);
  }
  #SetupUi() {
    this.#$settings = document.forms["settings"];
    this.#$settings.addEventListener("input", () => this.#invalidated = true);
    SetupRadioList(
      this.#$settings["face-shape"],
      this.#components.get("face").values(),
      MakeRadioOption("face-shape")
    );
    SetupRadioList(
      this.#$settings["eye-shape"],
      Array.from(this.#components.get("left eye").keys()).map((name) => ["left eye", "right eye"].map((type) => this.#components.get(type).get(name))),
      MakeRadioOption("eye-shape")
    );
    SetupRadioList(
      this.#$settings["mouth-shape"],
      this.#components.get("mouth").values(),
      MakeRadioOption("mouth-shape")
    );
  }
  //#endregion
  /* Life cycle */
  //#region
  async Start() {
    await WaitUntil(() => this.#ready);
    createCanvas(1, 1);
  }
  StepFrame() {
    if (!this.#ready)
      return;
    if (this.#invalidated) {
      this.Draw();
      this.#invalidated = false;
    }
  }
  //#endregion
  /* Drawing */
  //#region
  GetString(fieldName) {
    return this.#$settings[fieldName].value;
  }
  GetNumber(fieldName) {
    return +this.GetString(fieldName);
  }
  GetShape(collection, fieldName) {
    return this.#components.get(collection).get(this.#$settings[fieldName].value);
  }
  baseSize = [40, 40];
  get scale() {
    return this.GetNumber("scale");
  }
  get bgColor() {
    return this.GetString("bg-color");
  }
  get faceColor() {
    return this.GetString("face-color");
  }
  get faceShape() {
    return this.GetShape("face", "face-shape");
  }
  get eyeShapes() {
    return [this.GetShape("left eye", "eye-shape"), this.GetShape("right eye", "eye-shape")];
  }
  get eyeHeight() {
    return this.GetNumber("eye-height");
  }
  get eyeSplit() {
    return this.GetNumber("eye-split");
  }
  get mouthShape() {
    return this.GetShape("mouth", "mouth-shape");
  }
  get mouthDrop() {
    return this.GetNumber("mouth-drop");
  }
  Draw() {
    resizeCanvas(...this.baseSize.map((v) => v * this.scale));
    background(this.bgColor);
    resetMatrix();
    scale(this.scale, this.scale);
    noSmooth();
    translate(...this.baseSize.map((v) => Math.floor(v / 2)));
    tint(this.faceColor);
    this.DrawComponent(this.faceShape);
    noTint();
    this.DrawComponent(this.eyeShapes[0], [-this.eyeSplit, -this.eyeHeight]);
    this.DrawComponent(this.eyeShapes[1], [+this.eyeSplit, -this.eyeHeight]);
    this.DrawComponent(this.mouthShape, [0, 8 + this.mouthDrop]);
  }
  DrawComponent(component, pos = [0, 0]) {
    image(component.image, ...pos.map((v, i) => v - component.pivot[i]));
  }
  //#endregion
};
var app_default = App;

// src/index.mts
var app = new app_default();
window.preload = app_default.prototype.Initialize.bind(app);
window.setup = app_default.prototype.Start.bind(app);
window.draw = app_default.prototype.StepFrame.bind(app);
