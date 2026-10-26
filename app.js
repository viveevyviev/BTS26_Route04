/**
 * BTS Route 04 — Hourglass Kinetic Studio
 * Full Application Script (app.js)
 */

// Application Reactive State (Defaults to Light Theme & White Canvas)
const state = {
  uiTheme: 'light',
  aspectPreset: '16:9',
  customW: 1920,
  customH: 1080,
  contentMode: 'images',      // 'images' | 'text'
  spaceMode: '2d',            // '2d' | '3d'
  wrapStyle: 'hourglass',     // 'hourglass' | 'arc-lower' | 'pinch'
  orientation: 'horizontal',  // 'horizontal' | 'vertical'
  curviness: 0.65,
  circularArc: 180,           // degrees
  subdivisions: 140,
  slotGap: 0,
  manualMarqueeOffset: 0.0,
  autoMarqueeSpeed: 0.25,
  isPlaying: true,
  oscillateCurve: false,
  oscillationTicker: 0,

  // Text Flow State
  textRibbon: `stories stories stories stories
technology stories
ideas ideas ideas
conversations
solutions ideas
solutions ideas
solutions ideas
solutions ideas
conversations
ideas ideas stories
technology stories
stories stories stories stories`,
  textSize: 30,
  lineHeightFactor: 1.25,
  customFontFamily: 'Inter',

  // Canvas Background State
  bgMode: 'solid',
  solidColor: '#ffffff',
  gradientType: 'linear',
  gradColorA: '#222222',
  gradColorB: '#050505',
  gradAngle: 90,

  // Runtime Objects
  mediaItems: [],
  replaceTargetIndex: null,
  draggedCardIndex: null,
  accumulatedMotion: 0
};

// Procedural Card Factory (Monochrome Architectural Texture Samples)
function createProceduralCard(title, subtitle, colA, colB, motif) {
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 1200;
  const ctx = c.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, colA);
  g.addColorStop(1, colB);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  if (motif === 'pipe') {
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 90;
    ctx.beginPath();
    ctx.arc(300, 300, 520, 0, Math.PI / 2);
    ctx.stroke();
  } else if (motif === 'islands') {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(440, 480, 160, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(740, 700, 120, 0, Math.PI * 2); ctx.fill();
  } else if (motif === 'bridge') {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 1200); ctx.lineTo(600, 340); ctx.lineTo(1200, 1200);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(600, 340); ctx.lineTo(600, 1200);
    ctx.setLineDash([30, 20]); ctx.stroke(); ctx.setLineDash([]);
  } else if (motif === 'cad') {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 1200; i += 90) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1200); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1200, i); ctx.stroke();
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 52px Inter, sans-serif';
  ctx.fillText(title.toUpperCase(), 70, 140);
  ctx.font = '400 28px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(subtitle, 70, 195);

  return {
    id: 'media_' + Math.random().toString(36).substr(2, 9),
    name: title,
    canvas: c,
    dataUrl: c.toDataURL()
  };
}

state.mediaItems = [
  createProceduralCard('01 / Infrastructure', 'Industrial piping route', '#1a1a1a', '#080808', 'pipe'),
  createProceduralCard('02 / Aerial', 'Archipelago link span', '#222222', '#0d0d0d', 'islands'),
  createProceduralCard('03 / Mobility', 'Sea transit bridge', '#2c2c2c', '#111111', 'bridge'),
  createProceduralCard('04 / Network', 'Telecom transmission structure', '#1e1e1e', '#0a0a0a', 'cad'),
  createProceduralCard('05 / Engineering', 'Substructure frame nodal', '#282828', '#141414', 'cad'),
  createProceduralCard('06 / Structural', 'High-tensile steel matrix', '#161616', '#050505', 'pipe')
];

// Three.js Core Rig Setup
const container = document.getElementById('webgl-canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
camera.position.set(0, 0, 4.8);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true
});

// Requirement 3: Sharp Texture & Display Ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.NoToneMapping;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.0;
controls.maxDistance = 25;

// Sharp Texture Configurator
function configureSharpTexture(texture) {
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;
}

// Background Canvas Setup
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 1024;
bgCanvas.height = 1024;
const bgCtx = bgCanvas.getContext('2d');
const bgTexture = new THREE.CanvasTexture(bgCanvas);
configureSharpTexture(bgTexture);

function updateBackgroundRendering() {
  if (state.bgMode === 'transparent') {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
    return;
  }

  if (state.bgMode === 'solid') {
    scene.background = new THREE.Color(state.solidColor);
    renderer.setClearColor(new THREE.Color(state.solidColor), 1);
    return;
  }

  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  const w = bgCanvas.width;
  const h = bgCanvas.height;

  if (state.gradientType === 'linear') {
    const rad = (state.gradAngle * Math.PI) / 180;
    const x1 = w / 2 - Math.cos(rad) * (w / 2);
    const y1 = h / 2 - Math.sin(rad) * (h / 2);
    const x2 = w / 2 + Math.cos(rad) * (w / 2);
    const y2 = h / 2 + Math.sin(rad) * (h / 2);
    const g = bgCtx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, state.gradColorA);
    g.addColorStop(1, state.gradColorB);
    bgCtx.fillStyle = g;
    bgCtx.fillRect(0, 0, w, h);
  } else if (state.gradientType === 'radial') {
    const g = bgCtx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.4);
    g.addColorStop(0, state.gradColorA);
    g.addColorStop(1, state.gradColorB);
    bgCtx.fillStyle = g;
    bgCtx.fillRect(0, 0, w, h);
  } else if (state.gradientType === 'angle') {
    if (typeof bgCtx.createConicGradient === 'function') {
      const g = bgCtx.createConicGradient((state.gradAngle * Math.PI) / 180, w / 2, h / 2);
      g.addColorStop(0, state.gradColorA);
      g.addColorStop(0.5, state.gradColorB);
      g.addColorStop(1, state.gradColorA);
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0, 0, w, h);
    } else {
      const g = bgCtx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, state.gradColorA);
      g.addColorStop(1, state.gradColorB);
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0, 0, w, h);
    }
  } else if (state.gradientType === 'diamond') {
    const imgData = bgCtx.createImageData(w, h);
    const data = imgData.data;
    const c1 = hexToRgb(state.gradColorA);
    const c2 = hexToRgb(state.gradColorB);
    const half = w / 2;

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const dx = Math.abs(x - half) / half;
        const dy = Math.abs(y - half) / half;
        const d = Math.min(1, dx + dy);
        const r = Math.round(c1.r * (1 - d) + c2.r * d);
        const g = Math.round(c1.g * (1 - d) + c2.g * d);
        const b = Math.round(c1.b * (1 - d) + c2.b * d);

        for (let oy = 0; oy < 2; oy++) {
          for (let ox = 0; ox < 2; ox++) {
            const idx = ((y + oy) * w + (x + ox)) * 4;
            data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
          }
        }
      }
    }
    bgCtx.putImageData(imgData, 0, 0);
  }

  bgTexture.needsUpdate = true;
  scene.background = bgTexture;
  renderer.setClearColor(0x000000, 1);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Requirement 2: Aspect-Fill / Object-Cover Canvas Drawer
function drawImageCover(ctx, img, x, y, w, h) {
  const imgW = img.width || img.naturalWidth || 1;
  const imgH = img.height || img.naturalHeight || 1;
  const imgRatio = imgW / imgH;
  const slotRatio = w / h;
  let sx, sy, sw, sh;
  if (imgRatio > slotRatio) {
    sh = imgH;
    sw = imgH * slotRatio;
    sx = (imgW - sw) / 2;
    sy = 0;
  } else {
    sw = imgW;
    sh = imgW / slotRatio;
    sx = 0;
    sy = (imgH - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

// Requirement 1 & 2: Dynamic Sequence Width & Cover Atlas
const atlasCanvas = document.createElement('canvas');
const atlasCtx = atlasCanvas.getContext('2d');
let atlasTexture = new THREE.CanvasTexture(atlasCanvas);
configureSharpTexture(atlasTexture);

function updateTextureAtlas() {
  if (state.contentMode === 'text') {
    renderShapedTypography();
    return;
  }

  const items = state.mediaItems;
  const count = Math.max(items.length, 1);
  const slotSize = 1024; // Square 1:1 slot base
  const isVertical = state.orientation === 'vertical';

  // Total canvas dynamically matches sequence length
  if (!isVertical) {
    atlasCanvas.width = count * slotSize;
    atlasCanvas.height = slotSize;
  } else {
    atlasCanvas.width = slotSize;
    atlasCanvas.height = count * slotSize;
  }

  atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

  if (items.length === 0) {
    atlasCtx.fillStyle = '#111111';
    atlasCtx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
  } else {
    const gap = state.slotGap;
    items.forEach((item, idx) => {
      if (!isVertical) {
        const x = idx * slotSize;
        drawImageCover(
          atlasCtx,
          item.canvas,
          x + gap / 2,
          gap / 2,
          slotSize - gap,
          slotSize - gap
        );
      } else {
        const y = idx * slotSize;
        drawImageCover(
          atlasCtx,
          item.canvas,
          gap / 2,
          y + gap / 2,
          slotSize - gap,
          slotSize - gap
        );
      }
    });
  }

  atlasTexture.dispose();
  atlasTexture = new THREE.CanvasTexture(atlasCanvas);
  configureSharpTexture(atlasTexture);

  if (hourglassMaterial) {
    hourglassMaterial.uniforms.tDiffuse.value = atlasTexture;
    hourglassMaterial.uniforms.uImageCount.value = count;
  }
}

// Shaped Typography Flow (No Box/Stroke Fill, Pure Text Contour)
function renderShapedTypography() {
  atlasCanvas.width = 2048;
  atlasCanvas.height = 2048;
  atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

  const w = atlasCanvas.width;
  const h = atlasCanvas.height;
  const isVertical = state.orientation === 'vertical';

  const rawLines = state.textRibbon.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (rawLines.length === 0) return;

  const fontSize = state.textSize * 2.2;
  const lineSpacing = fontSize * state.lineHeightFactor;
  atlasCtx.font = `600 ${fontSize}px "${state.customFontFamily}", Inter, sans-serif`;

  const isLightBg = (state.bgMode === 'solid' && state.solidColor.toLowerCase() === '#ffffff') ||
                    (state.bgMode === 'transparent' && state.uiTheme === 'light');
  atlasCtx.fillStyle = isLightBg ? '#000000' : '#ffffff';
  atlasCtx.textAlign = 'center';
  atlasCtx.textBaseline = 'middle';

  const intensity = state.curviness;

  if (isVertical) {
    const totalLines = rawLines.length;
    const blockHeight = totalLines * lineSpacing;
    const startY = (h - blockHeight) / 2 + lineSpacing / 2;

    rawLines.forEach((line, idx) => {
      const y = startY + idx * lineSpacing;
      const normY = (y - h / 2) / (h / 2);

      let pinchFactor = 1.0;
      if (state.wrapStyle === 'hourglass') {
        pinchFactor = 1.0 - intensity * (1.0 - Math.pow(normY, 2)) * 0.65;
      } else if (state.wrapStyle === 'arc-lower') {
        pinchFactor = 1.0 - intensity * (1.0 - normY) * 0.45;
      } else if (state.wrapStyle === 'pinch') {
        pinchFactor = 1.0 - intensity * Math.exp(-Math.pow(normY * 2.4, 2)) * 0.75;
      }

      const maxLineWidth = Math.max(100, (w * 0.9) * Math.max(0.2, pinchFactor));

      atlasCtx.save();
      const measuredW = atlasCtx.measureText(line).width;
      if (measuredW > maxLineWidth) {
        const scale = maxLineWidth / measuredW;
        atlasCtx.translate(w / 2, y);
        atlasCtx.scale(scale, scale);
        atlasCtx.fillText(line, 0, 0);
      } else {
        atlasCtx.fillText(line, w / 2, y);
      }
      atlasCtx.restore();
    });
  } else {
    const totalLines = rawLines.length;
    const blockHeight = totalLines * lineSpacing;
    const startY = (h - blockHeight) / 2 + lineSpacing / 2;

    rawLines.forEach((line, idx) => {
      const y = startY + idx * lineSpacing;
      atlasCtx.fillText(line, w / 2, y);
    });
  }

  atlasTexture.dispose();
  atlasTexture = new THREE.CanvasTexture(atlasCanvas);
  configureSharpTexture(atlasTexture);

  if (hourglassMaterial) {
    hourglassMaterial.uniforms.tDiffuse.value = atlasTexture;
    hourglassMaterial.uniforms.uImageCount.value = 1.0;
  }
}

// GLSL Shaders for Continuous Geometry & Aspect-Fill Sampling
const vertexShader = `
  varying vec2 vUv;
  varying float vPinch;

  uniform float uCurviness;
  uniform int uWrapStyle;
  uniform int uOrientation;
  uniform int uIs3D;
  uniform float uCircularArc;
  uniform float uTotalWidth;
  uniform float uTotalHeight;
  uniform int uContentMode;

  void main() {
    vUv = uv;

    float u = position.x / (uTotalWidth * 0.5);
    float v = position.y / (uTotalHeight * 0.5);

    float pinch = 1.0;

    if (uContentMode == 0) {
      if (uOrientation == 0) {
        if (uWrapStyle == 0) {
          pinch = 1.0 - uCurviness * (1.0 - u * u) * 0.46;
        } else if (uWrapStyle == 1) {
          float normV = (v + 1.0) * 0.5;
          pinch = 1.0 - normV * (uCurviness * (1.0 - u * u) * 0.55);
        } else if (uWrapStyle == 2) {
          pinch = 1.0 - uCurviness * exp(-pow(u * 2.6, 2.0)) * 0.58;
        }
      } else {
        if (uWrapStyle == 0) {
          pinch = 1.0 - uCurviness * (1.0 - v * v) * 0.46;
        } else if (uWrapStyle == 1) {
          float normV = (v + 1.0) * 0.5;
          pinch = 1.0 - normV * (uCurviness * (1.0 - v * v) * 0.55);
        } else if (uWrapStyle == 2) {
          pinch = 1.0 - uCurviness * exp(-pow(v * 2.6, 2.0)) * 0.58;
        }
      }
    }

    vPinch = pinch;
    vec3 pos = position;

    if (uContentMode == 0) {
      if (uOrientation == 0) {
        if (uWrapStyle == 1) {
          float normV = (v + 1.0) * 0.5;
          pos.y -= normV * (uCurviness * (1.0 - u * u) * (uTotalHeight * 0.55));
        } else {
          pos.y *= pinch;
        }
      } else {
        if (uWrapStyle == 1) {
          float normV = (v + 1.0) * 0.5;
          pos.y -= normV * (uCurviness * (1.0 - v * v) * (uTotalHeight * 0.55));
        } else {
          pos.x *= pinch;
        }
      }
    }

    if (uIs3D == 1) {
      float radius = uTotalWidth / uCircularArc;
      float theta = (pos.x / uTotalWidth) * uCircularArc;
      pos.x = sin(theta) * radius;
      pos.z = -cos(theta) * radius + radius;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uImageCount;
  uniform float uOffset;
  uniform int uOrientation;
  uniform int uContentMode;

  varying vec2 vUv;
  varying float vPinch;

  void main() {
    if (uContentMode == 1) {
      gl_FragColor = texture2D(tDiffuse, vUv);
      return;
    }

    vec2 finalUv;

    if (uOrientation == 0) {
      float uScrolled = fract(vUv.x + uOffset);
      float frameFloat = uScrolled * uImageCount;
      float frameIndex = floor(frameFloat);
      float uLocal = fract(frameFloat);

      // Requirement 2: Aspect-Fill / Cover around center (uv - 0.5)
      vec2 centered = vec2(uLocal - 0.5, vUv.y - 0.5);
      centered.y *= vPinch;

      vec2 localCoverUv = clamp(centered + 0.5, 0.0, 1.0);
      float atlasU = (frameIndex + localCoverUv.x) / uImageCount;
      finalUv = vec2(atlasU, localCoverUv.y);
    } else {
      float vScrolled = fract(vUv.y + uOffset);
      float frameFloat = vScrolled * uImageCount;
      float frameIndex = floor(frameFloat);
      float vLocal = fract(frameFloat);

      vec2 centered = vec2(vUv.x - 0.5, vLocal - 0.5);
      centered.x *= vPinch;

      vec2 localCoverUv = clamp(centered + 0.5, 0.0, 1.0);
      float atlasV = (frameIndex + localCoverUv.y) / uImageCount;
      finalUv = vec2(localCoverUv.x, atlasV);
    }

    gl_FragColor = texture2D(tDiffuse, finalUv);
  }
`;

const hourglassUniforms = {
  tDiffuse: { value: atlasTexture },
  uCurviness: { value: state.curviness },
  uWrapStyle: { value: 0 },
  uOrientation: { value: 0 },
  uIs3D: { value: 0 },
  uCircularArc: { value: (state.circularArc * Math.PI) / 180 },
  uTotalWidth: { value: 1.6 },
  uTotalHeight: { value: 1.6 },
  uContentMode: { value: 0 },
  uImageCount: { value: 6.0 },
  uOffset: { value: 0.0 }
};

let surfaceMesh = null;
let hourglassMaterial = null;

// Requirement 1 & 4: Mesh Generation (Dynamic Sequence Width)
function buildHourglassMesh() {
  if (surfaceMesh) {
    scene.remove(surfaceMesh);
    if (surfaceMesh.geometry) surfaceMesh.geometry.dispose();
  }

  const items = state.mediaItems;
  const count = Math.max(items.length, 1);
  const H = 1.6; // Center frame dimension (1:1 square ratio)

  const isHorizontal = state.orientation === 'horizontal';

  // Total sequence width/height scales with item count
  let totalWidth, totalHeight;
  if (isHorizontal) {
    totalWidth = count * H;
    totalHeight = H;
  } else {
    totalWidth = H;
    totalHeight = count * H;
  }

  const segX = isHorizontal ? Math.max(60, count * 30) : 60;
  const segY = isHorizontal ? 60 : Math.max(60, count * 30);

  const geometry = new THREE.PlaneGeometry(totalWidth, totalHeight, segX, segY);

  if (!hourglassMaterial) {
    hourglassMaterial = new THREE.ShaderMaterial({
      uniforms: hourglassUniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true
    });
  }

  hourglassMaterial.uniforms.tDiffuse.value = atlasTexture;
  hourglassMaterial.uniforms.uCurviness.value = state.curviness;
  hourglassMaterial.uniforms.uWrapStyle.value =
    state.wrapStyle === 'hourglass' ? 0 : state.wrapStyle === 'arc-lower' ? 1 : 2;
  hourglassMaterial.uniforms.uOrientation.value = isHorizontal ? 0 : 1;
  hourglassMaterial.uniforms.uIs3D.value = state.spaceMode === '3d' ? 1 : 0;
  hourglassMaterial.uniforms.uCircularArc.value = (state.circularArc * Math.PI) / 180;
  hourglassMaterial.uniforms.uTotalWidth.value = totalWidth;
  hourglassMaterial.uniforms.uTotalHeight.value = totalHeight;
  hourglassMaterial.uniforms.uContentMode.value = state.contentMode === 'images' ? 0 : 1;
  hourglassMaterial.uniforms.uImageCount.value = count;

  surfaceMesh = new THREE.Mesh(geometry, hourglassMaterial);
  scene.add(surfaceMesh);
}

// Preview Frame Sizing & Resizing
const previewFrame = document.getElementById('preview-frame');
const previewWrapper = document.getElementById('preview-frame-wrapper');
const aspectTag = document.getElementById('frame-aspect-tag');

function resizePreviewFrame() {
  const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const containerW = isFullscreen ? window.innerWidth : previewWrapper.clientWidth;
  const containerH = isFullscreen ? window.innerHeight : previewWrapper.clientHeight;

  let targetRatio = 16 / 9;
  let tagText = state.aspectPreset;

  if (state.aspectPreset === '16:9') targetRatio = 16 / 9;
  else if (state.aspectPreset === '1:1') targetRatio = 1 / 1;
  else if (state.aspectPreset === '4:3') targetRatio = 4 / 3;
  else if (state.aspectPreset === '9:16') targetRatio = 9 / 16;
  else if (state.aspectPreset === '21:9') targetRatio = 21 / 9;
  else if (state.aspectPreset === 'custom') {
    targetRatio = state.customW / state.customH;
    tagText = `${state.customW}×${state.customH}`;
  }

  aspectTag.textContent = tagText;

  let frameW, frameH;

  if (isFullscreen) {
    frameW = containerW;
    frameH = frameW / targetRatio;
    if (frameH > containerH) {
      frameH = containerH;
      frameW = frameH * targetRatio;
    }
  } else {
    const maxW = containerW - 48;
    const maxH = containerH - 70;
    frameW = maxW;
    frameH = frameW / targetRatio;
    if (frameH > maxH) {
      frameH = maxH;
      frameW = frameH * targetRatio;
    }
  }

  previewFrame.style.width = Math.round(frameW) + 'px';
  previewFrame.style.height = Math.round(frameH) + 'px';

  renderer.setSize(frameW, frameH);
  camera.aspect = frameW / frameH;
  camera.updateProjectionMatrix();
}

// Sequence Strip UI & Drag Reorder
const stripList = document.getElementById('strip-list');
const sequenceCount = document.getElementById('sequence-count');

function renderSequenceStrip() {
  stripList.innerHTML = '';
  sequenceCount.textContent = `${state.mediaItems.length} items`;

  state.mediaItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'strip-card';
    card.draggable = true;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="drag-grip" title="Drag to reorder">
        <svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
      </div>
      <img class="strip-card-thumb" src="${item.dataUrl}" alt="${item.name}">
      <span class="strip-card-title">${item.name}</span>
      <div class="strip-card-actions">
        <button class="card-icon-btn btn-replace" title="Replace image" data-index="${index}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
        </button>
        <button class="card-icon-btn btn-delete" title="Remove" data-index="${index}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;

    card.addEventListener('dragstart', (e) => {
      state.draggedCardIndex = index;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-target');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-target');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-target');
      const fromIdx = state.draggedCardIndex;
      const toIdx = index;
      if (fromIdx !== null && fromIdx !== toIdx) {
        const moved = state.mediaItems.splice(fromIdx, 1)[0];
        state.mediaItems.splice(toIdx, 0, moved);
        renderSequenceStrip();
        updateTextureAtlas();
        buildHourglassMesh();
      }
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      state.draggedCardIndex = null;
    });

    stripList.appendChild(card);
  });

  stripList.querySelectorAll('.btn-replace').forEach(b => {
    b.onclick = () => {
      state.replaceTargetIndex = parseInt(b.dataset.index);
      document.getElementById('replace-file-input').click();
    };
  });

  stripList.querySelectorAll('.btn-delete').forEach(b => {
    b.onclick = () => {
      const idx = parseInt(b.dataset.index);
      state.mediaItems.splice(idx, 1);
      renderSequenceStrip();
      updateTextureAtlas();
      buildHourglassMesh();
    };
  });
}

// File Upload Handlers
const multiFileInput = document.getElementById('multi-file-input');
const replaceFileInput = document.getElementById('replace-file-input');
const dropzone = document.getElementById('dropzone');

dropzone.onclick = () => multiFileInput.click();
multiFileInput.onchange = (e) => addFilesToSequence(e.target.files);

dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('drag-active'); };
dropzone.ondragleave = () => dropzone.classList.remove('drag-active');
dropzone.ondrop = (e) => {
  e.preventDefault();
  dropzone.classList.remove('drag-active');
  if (e.dataTransfer.files.length) addFilesToSequence(e.dataTransfer.files);
};

function addFilesToSequence(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || 1200;
        c.height = img.naturalHeight || 1200;
        c.getContext('2d').drawImage(img, 0, 0);

        state.mediaItems.push({
          id: 'media_' + Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ""),
          canvas: c,
          dataUrl: ev.target.result
        });
        renderSequenceStrip();
        updateTextureAtlas();
        buildHourglassMesh();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

replaceFileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file || state.replaceTargetIndex === null) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 1200;
      c.height = img.naturalHeight || 1200;
      c.getContext('2d').drawImage(img, 0, 0);

      state.mediaItems[state.replaceTargetIndex] = {
        id: 'media_' + Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ""),
        canvas: c,
        dataUrl: ev.target.result
      };
      renderSequenceStrip();
      updateTextureAtlas();
      replaceFileInput.value = '';
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};

// Font Upload
const fontDropzone = document.getElementById('font-dropzone');
const fontFileInput = document.getElementById('font-file-input');
const fontStatusLabel = document.getElementById('font-status-label');

fontDropzone.onclick = () => fontFileInput.click();
fontFileInput.onchange = (e) => {
  if (e.target.files[0]) loadCustomFont(e.target.files[0]);
};

function loadCustomFont(file) {
  const fontName = 'CustomFont_' + Math.random().toString(36).substr(2, 6);
  const reader = new FileReader();
  reader.onload = (ev) => {
    const font = new FontFace(fontName, ev.target.result);
    font.load().then(loadedFont => {
      document.fonts.add(loadedFont);
      state.customFontFamily = fontName;
      fontStatusLabel.textContent = file.name;
      updateTextureAtlas();
    }).catch(err => alert("Font load error: " + err));
  };
  reader.readAsArrayBuffer(file);
}

// UI Setup Helpers
function setupSegmented(id, onSelect) {
  const el = document.getElementById(id);
  const btns = el.querySelectorAll('.segment-btn');
  btns.forEach(btn => {
    btn.onclick = () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onSelect(btn.dataset.value);
    };
  });
}

document.querySelectorAll('.accordion-header').forEach(head => {
  head.onclick = () => head.parentElement.classList.toggle('open');
});

// Theme Toggle
document.getElementById('btn-theme-toggle').onclick = () => {
  state.uiTheme = state.uiTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', state.uiTheme);
  updateTextureAtlas();
};

document.getElementById('btn-toggle-sidebar').onclick = () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  setTimeout(resizePreviewFrame, 220);
};

// Aspect Preset & Dimensions
const aspectDropdown = document.getElementById('aspect-preset');
const customDimGroup = document.getElementById('custom-dim-group');
const dimWInput = document.getElementById('dim-w');
const dimHInput = document.getElementById('dim-h');

aspectDropdown.onchange = () => {
  state.aspectPreset = aspectDropdown.value;
  customDimGroup.style.display = state.aspectPreset === 'custom' ? 'flex' : 'none';
  resizePreviewFrame();
};

dimWInput.oninput = () => {
  state.customW = parseInt(dimWInput.value) || 1920;
  resizePreviewFrame();
};
dimHInput.oninput = () => {
  state.customH = parseInt(dimHInput.value) || 1080;
  resizePreviewFrame();
};

// Reset Camera
document.getElementById('btn-reset-camera').onclick = () => {
  camera.position.set(0, 0, 4.8);
  controls.target.set(0, 0, 0);
  controls.update();
};

// Fullscreen
const btnFrameFullscreen = document.getElementById('btn-frame-fullscreen');
const lblFullscreen = document.getElementById('lbl-fullscreen');

btnFrameFullscreen.onclick = () => {
  if (!document.fullscreenElement) {
    if (previewFrame.requestFullscreen) previewFrame.requestFullscreen();
    else if (previewFrame.webkitRequestFullscreen) previewFrame.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
};

document.addEventListener('fullscreenchange', () => {
  const isFs = !!document.fullscreenElement;
  lblFullscreen.textContent = isFs ? 'Exit' : 'Fullscreen';
  setTimeout(resizePreviewFrame, 120);
});

// Play / Pause Motion
const barBtnPlay = document.getElementById('bar-btn-play');
const iconPlay = document.getElementById('icon-bar-play');
const iconPause = document.getElementById('icon-bar-pause');
const lblPlay = document.getElementById('lbl-bar-play');

barBtnPlay.onclick = () => {
  state.isPlaying = !state.isPlaying;
  iconPlay.style.display = state.isPlaying ? 'none' : 'inline-block';
  iconPause.style.display = state.isPlaying ? 'inline-block' : 'none';
  lblPlay.textContent = state.isPlaying ? 'Pause' : 'Play';
};

// Content Mode
setupSegmented('content-mode-segment', (val) => {
  state.contentMode = val;
  document.getElementById('image-mode-subpanel').style.display = val === 'images' ? 'flex' : 'none';
  document.getElementById('text-mode-subpanel').style.display = val === 'text' ? 'flex' : 'none';
  updateTextureAtlas();
  buildHourglassMesh();
});

document.getElementById('param-slot-gap').oninput = (e) => {
  state.slotGap = parseInt(e.target.value);
  document.getElementById('val-slot-gap').textContent = state.slotGap + 'px';
  updateTextureAtlas();
};

const offsetSlider = document.getElementById('param-marquee-offset');
offsetSlider.oninput = (e) => {
  state.manualMarqueeOffset = parseFloat(e.target.value) / 100;
  document.getElementById('val-marquee-offset').textContent = e.target.value + '%';
};

document.getElementById('btn-reset-offset').onclick = () => {
  state.manualMarqueeOffset = 0;
  state.accumulatedMotion = 0;
  offsetSlider.value = 0;
  document.getElementById('val-marquee-offset').textContent = '0%';
};

// Text Controls
document.getElementById('text-ribbon-content').oninput = (e) => {
  state.textRibbon = e.target.value;
  updateTextureAtlas();
};
document.getElementById('param-text-size').oninput = (e) => {
  state.textSize = parseInt(e.target.value);
  document.getElementById('val-text-size').textContent = state.textSize + 'px';
  updateTextureAtlas();
};
document.getElementById('param-line-height').oninput = (e) => {
  state.lineHeightFactor = parseFloat(e.target.value);
  document.getElementById('val-line-height').textContent = state.lineHeightFactor.toFixed(2);
  updateTextureAtlas();
};

// Geometry Controls
setupSegmented('space-mode-segment', (val) => {
  state.spaceMode = val;
  document.getElementById('row-circular-arc').style.display = val === '3d' ? 'flex' : 'none';
  buildHourglassMesh();
});

setupSegmented('orientation-segment', (val) => {
  state.orientation = val;
  updateTextureAtlas();
  buildHourglassMesh();
});

setupSegmented('curve-profile-segment', (val) => {
  state.wrapStyle = val;
  updateTextureAtlas();
  buildHourglassMesh();
});

const curviInput = document.getElementById('param-curviness');
curviInput.oninput = (e) => {
  state.curviness = parseFloat(e.target.value);
  document.getElementById('val-curviness').textContent = state.curviness.toFixed(2);
  updateTextureAtlas();
  if (hourglassMaterial) {
    hourglassMaterial.uniforms.uCurviness.value = state.curviness;
  }
};

document.getElementById('param-circular-arc').oninput = (e) => {
  state.circularArc = parseInt(e.target.value);
  document.getElementById('val-circular-arc').textContent = state.circularArc + '°';
  if (hourglassMaterial) {
    hourglassMaterial.uniforms.uCircularArc.value = (state.circularArc * Math.PI) / 180;
  }
};

document.getElementById('param-subdivisions').oninput = (e) => {
  state.subdivisions = parseInt(e.target.value);
  document.getElementById('val-subdivisions').textContent = state.subdivisions;
  buildHourglassMesh();
};

// Kinetic Animation
document.getElementById('param-marquee-speed').oninput = (e) => {
  state.autoMarqueeSpeed = parseFloat(e.target.value);
  document.getElementById('val-marquee-speed').textContent = state.autoMarqueeSpeed.toFixed(2);
};

const btnOscillate = document.getElementById('btn-toggle-oscillate');
btnOscillate.onclick = () => {
  state.oscillateCurve = !state.oscillateCurve;
  btnOscillate.firstElementChild.textContent = state.oscillateCurve ? 'Oscillate curve: On' : 'Oscillate curve: Off';
};

// Background Controls
setupSegmented('bg-mode-segment', (val) => {
  state.bgMode = val;
  document.getElementById('bg-solid-options').style.display = val === 'solid' ? 'flex' : 'none';
  document.getElementById('bg-gradient-options').style.display = val === 'gradient' ? 'flex' : 'none';
  updateBackgroundRendering();
  updateTextureAtlas();
});

document.getElementById('bg-solid-color-picker').oninput = (e) => {
  state.solidColor = e.target.value;
  updateBackgroundRendering();
  updateTextureAtlas();
};

setupSegmented('gradient-type-segment', (val) => {
  state.gradientType = val;
  document.getElementById('grad-angle-row').style.display = (val === 'linear' || val === 'angle') ? 'flex' : 'none';
  updateBackgroundRendering();
});

document.getElementById('grad-color-a').oninput = (e) => {
  state.gradColorA = e.target.value;
  updateBackgroundRendering();
};
document.getElementById('grad-color-b').oninput = (e) => {
  state.gradColorB = e.target.value;
  updateBackgroundRendering();
};
document.getElementById('param-grad-angle').oninput = (e) => {
  state.gradAngle = parseInt(e.target.value);
  document.getElementById('val-grad-angle').textContent = state.gradAngle + '°';
  updateBackgroundRendering();
};

// Export Logic
const exportModal = document.getElementById('export-modal');
document.getElementById('btn-open-export').onclick = () => exportModal.classList.add('open');
document.getElementById('btn-close-modal').onclick = () => exportModal.classList.remove('open');
document.getElementById('btn-cancel-export').onclick = () => exportModal.classList.remove('open');

let exportMediaType = 'image';
let exportImgFormat = 'png';
let exportVidFormat = 'webm';
let exportScale = 1;
let exportFps = 60;
let exportDuration = 6;
let exportJpegQuality = 0.92;

setupSegmented('export-media-type-segment', (val) => {
  exportMediaType = val;
  document.getElementById('export-image-options').style.display = val === 'image' ? 'flex' : 'none';
  document.getElementById('export-video-options').style.display = val === 'video' ? 'flex' : 'none';
});

setupSegmented('export-img-format-segment', (val) => {
  exportImgFormat = val;
  document.getElementById('jpeg-quality-group').style.display = val === 'jpeg' ? 'flex' : 'none';
});

setupSegmented('export-vid-format-segment', (val) => { exportVidFormat = val; });
setupSegmented('export-scale-segment', (val) => { exportScale = parseInt(val); });
setupSegmented('export-fps-segment', (val) => { exportFps = parseInt(val); });

document.getElementById('param-jpeg-quality').oninput = (e) => {
  exportJpegQuality = parseInt(e.target.value) / 100;
  document.getElementById('val-jpeg-quality').textContent = e.target.value + '%';
};

document.getElementById('param-vid-duration').oninput = (e) => {
  exportDuration = parseInt(e.target.value);
  document.getElementById('val-vid-duration').textContent = exportDuration + 's';
};

document.getElementById('btn-start-export').onclick = () => {
  if (exportMediaType === 'image') executeImageExport();
  else executeVideoExport();
};

function executeImageExport() {
  const curAspect = previewFrame.clientWidth / previewFrame.clientHeight;
  const baseW = state.aspectPreset === 'custom' ? state.customW : (curAspect >= 1 ? 1920 : 1080);
  const baseH = state.aspectPreset === 'custom' ? state.customH : Math.round(baseW / curAspect);

  const outW = baseW * exportScale;
  const outH = baseH * exportScale;

  renderer.setSize(outW, outH, false);
  camera.aspect = outW / outH;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);

  const mime = exportImgFormat === 'png' ? 'image/png' : 'image/jpeg';
  const dataURL = renderer.domElement.toDataURL(mime, exportJpegQuality);

  const link = document.createElement('a');
  link.download = `BTS-Route-04-${Date.now()}.${exportImgFormat}`;
  link.href = dataURL;
  link.click();

  resizePreviewFrame();
  exportModal.classList.remove('open');
}

function executeVideoExport() {
  const pBox = document.getElementById('export-progress-box');
  const pFill = document.getElementById('export-progress-fill');
  const pLabel = document.getElementById('export-status-label');
  const pPct = document.getElementById('export-progress-pct');
  pBox.style.display = 'flex';

  const curAspect = previewFrame.clientWidth / previewFrame.clientHeight;
  const targetW = (state.aspectPreset === 'custom' ? state.customW : (curAspect >= 1 ? 1920 : 1080)) * Math.min(2, exportScale);
  const targetH = Math.round(targetW / curAspect);

  renderer.setSize(targetW, targetH, false);
  camera.aspect = targetW / targetH;
  camera.updateProjectionMatrix();

  let mimeType = 'video/webm; codecs=vp9';
  if (exportVidFormat === 'mp4') {
    if (MediaRecorder.isTypeSupported('video/mp4; codecs=avc1')) {
      mimeType = 'video/mp4; codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }
  }

  const stream = renderer.domElement.captureStream(exportFps);
  const recorder = new MediaRecorder(stream, {
    mimeType: mimeType,
    videoBitsPerSecond: 16000000
  });

  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BTS-Route-04-loop-${Date.now()}.${exportVidFormat === 'mp4' ? 'mp4' : 'webm'}`;
    link.click();
    URL.revokeObjectURL(url);

    pBox.style.display = 'none';
    exportModal.classList.remove('open');
    resizePreviewFrame();
  };

  recorder.start();
  const startTime = performance.now();
  const totalMs = exportDuration * 1000;

  const timer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));
    pFill.style.width = progress + '%';
    pPct.textContent = progress + '%';
    pLabel.textContent = `Encoding (${(elapsed / 1000).toFixed(1)}s / ${exportDuration}s)...`;

    if (elapsed >= totalMs) {
      clearInterval(timer);
      recorder.stop();
    }
  }, 80);
}

// Animation Loop with GPU Uniform Sync
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);
  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (state.isPlaying) {
    state.accumulatedMotion += delta * state.autoMarqueeSpeed * 0.15;
  }

  const totalOffset = (state.accumulatedMotion + state.manualMarqueeOffset) % 1.0;
  if (hourglassMaterial) {
    hourglassMaterial.uniforms.uOffset.value = totalOffset;
  }

  if (state.oscillateCurve) {
    state.oscillationTicker += delta * 2.5;
    const wave = (Math.sin(state.oscillationTicker) + 1) / 2;
    state.curviness = 0.15 + wave * 1.35;
    document.getElementById('val-curviness').textContent = state.curviness.toFixed(2);
    curviInput.value = state.curviness;
    if (hourglassMaterial) {
      hourglassMaterial.uniforms.uCurviness.value = state.curviness;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', resizePreviewFrame);

// Studio Boot
renderSequenceStrip();
updateTextureAtlas();
updateBackgroundRendering();
buildHourglassMesh();
resizePreviewFrame();
requestAnimationFrame(animate);
