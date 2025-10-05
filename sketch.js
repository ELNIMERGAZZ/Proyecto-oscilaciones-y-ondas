let A1Slider, A2Slider, f1Slider, f2Slider, phi1Slider, phi2Slider;
let A1Val, A2Val, f1Val, f2Val, phi1Val, phi2Val;
let play = false;
let mode = "Tiempo";
let t = 0;

// Audio
let audioCtx = null;
let osc1 = null, osc2 = null;
let gain1 = null, gain2 = null;
let merger = null;

function setup() {
  createCanvas(800, 500);
  textAlign(CENTER);
  textSize(14);
  strokeWeight(2);

  // Vincular sliders
  A1Slider = select("#A1");
  A2Slider = select("#A2");
  f1Slider = select("#f1");
  f2Slider = select("#f2");
  phi1Slider = select("#phi1");
  phi2Slider = select("#phi2");

  A1Val = select("#A1Val");
  A2Val = select("#A2Val");
  f1Val = select("#f1Val");
  f2Val = select("#f2Val");
  phi1Val = select("#phi1Val");
  phi2Val = select("#phi2Val");

  // Botones
  select("#resetBtn").mousePressed(resetValues);
  select("#playBtn").mousePressed(togglePlay);
  select("#modeBtn").mousePressed(toggleMode);

  // Listeners
  A1Slider.input(updateValues);
  A2Slider.input(updateValues);
  f1Slider.input(updateValues);
  f2Slider.input(updateValues);
  phi1Slider.input(updateValues);
  phi2Slider.input(updateValues);

  updateValues();
}

function draw() {
  background(0);
  stroke(0, 255, 0);
  noFill();

  const A1 = float(A1Slider.value());
  const A2 = float(A2Slider.value());
  const f1 = float(f1Slider.value());
  const f2 = float(f2Slider.value());
  const phi1 = radians(float(phi1Slider.value()));
  const phi2 = radians(float(phi2Slider.value()));

  if (mode === "Tiempo") {
    beginShape();
    for (let i = 0; i < width; i++) {
      let time = t + i / width;
      let x = A1 * cos(TWO_PI * f1 * time + phi1);
      let y = A2 * cos(TWO_PI * f2 * time + phi2);
      vertex(i, height / 2 + (x + y) * 100);
    }
    endShape();
    fill(0, 255, 0);
    noStroke();
    text("Modo: TIEMPO", width / 2, 20);
  } else {
    beginShape();
    for (let i = 0; i < 1000; i++) {
      let time = i / 1000;
      let x = A1 * cos(TWO_PI * f1 * time + phi1);
      let y = A2 * cos(TWO_PI * f2 * time + phi2);
      vertex(width / 2 + x * 200, height / 2 + y * 200);
    }
    endShape();
    fill(0, 255, 0);
    noStroke();
    text("Modo: XY (Lissajous)", width / 2, 20);
  }

  if (play) {
    t += deltaTime / 1000.0;
    updateAudio(f1, f2, A1, A2);
  }
}

function updateValues() {
  A1Val.html(nf(A1Slider.value(), 1, 2));
  A2Val.html(nf(A2Slider.value(), 1, 2));
  f1Val.html(f1Slider.value() + " Hz");
  f2Val.html(f2Slider.value() + " Hz");
  phi1Val.html(phi1Slider.value() + "°");
  phi2Val.html(phi2Slider.value() + "°");
}

function togglePlay() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  if (play) {
    stopAudio();
    play = false;
  } else {
    startAudio();
    play = true;
  }
}

function toggleMode() {
  mode = mode === "Tiempo" ? "XY" : "Tiempo";
}

function resetValues() {
  A1Slider.value(0.5);
  A2Slider.value(0.5);
  f1Slider.value(220);
  f2Slider.value(330);
  phi1Slider.value(0);
  phi2Slider.value(0);
  play = false;
  t = 0;
  updateValues();
  stopAudio();
}

// --- AUDIO LOGIC ---
function startAudio() {
  stopAudio();

  const A1 = parseFloat(A1Slider.value());
  const A2 = parseFloat(A2Slider.value());
  const f1 = parseFloat(f1Slider.value());
  const f2 = parseFloat(f2Slider.value());

  osc1 = audioCtx.createOscillator();
  osc2 = audioCtx.createOscillator();
  gain1 = audioCtx.createGain();
  gain2 = audioCtx.createGain();
  merger = audioCtx.createChannelMerger(2);

  osc1.type = "sine";
  osc2.type = "sine";
  gain1.gain.value = A1;
  gain2.gain.value = A2;
  osc1.frequency.value = f1;
  osc2.frequency.value = f2;

  osc1.connect(gain1).connect(merger, 0, 0);
  osc2.connect(gain2).connect(merger, 0, 1);
  merger.connect(audioCtx.destination);

  osc1.start();
  osc2.start();
}

function updateAudio(f1, f2, A1, A2) {
  if (!osc1 || !osc2) return;
  try {
    osc1.frequency.value = f1;
    osc2.frequency.value = f2;
    gain1.gain.value = A1;
    gain2.gain.value = A2;
  } catch (err) {}
}

function stopAudio() {
  try {
    if (osc1) { osc1.stop(); osc1.disconnect(); }
    if (osc2) { osc2.stop(); osc2.disconnect(); }
  } catch (err) {}
  osc1 = null;
  osc2 = null;
}
