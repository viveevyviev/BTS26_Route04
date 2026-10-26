/**
 * BTS Route 04 — Hourglass Kinetic Studio
 * Dynamic 1:1 Aspect-Fill Shader & Universal Marquee/Aperture Decoupling
 */

// Application Reactive State
const state = {
  uiTheme: 'light',
  aspectPreset: '16:9',
  customW: 1920,
  customH: 1080,
  contentMode: 'images',          // 'images' | 'text'
  spaceMode: '2d',                // '2d' | '3d'
  wrapStyle: 'hourglass',         // 'hourglass' | 'arc-lower' | 'pinch'
  orientation: 'horizontal',      // Aperture Axis: 'horizontal' (Left/Right Gates) | 'vertical' (Top/Bottom Gates)
  marqueeDirection: 'horizontal', // Flow Direction: 'horizontal' (X-scroll) | 'vertical' (Y-scroll)
  apertureWidth: 0.35,            // Gate translation offset [0.0 - 1.5]
  curveRadius: 1.20,              // Fixed curvature radius (R)
  curviness: 0.65,                // Curvature depth scale
  circularArc: 180,               // 3D cylindrical arc degrees
  subdivisions: 140,
  slotGap: 0,
  manualMarqueeOffset: 0.0,
  autoMarqueeSpeed: 0.25,
  isPlaying: true,
  oscillateCurve: false,
  oscillationTicker: 0,

  // Text Ribbon
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

  // Canvas Background
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

// Procedural Media Samples
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

// Requirement 3: Sharp Texture & Pixel Ratio Setup
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.NoToneMapping;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.0;
controls.maxDistance = 25;

// Requirement 3: Sharp Texture Configuration Helper
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
    if (apertureMaterial) {
      apertureMaterial.uniforms.uBlinderAlpha.value = 0.0;
      apertureMaterial.uniforms.uBgMode.value = 0;
    }
    return;
  }

  if (state.bgMode === 'solid') {
    scene.background = new THREE.Color(state.solidColor);
    renderer.setClearColor(new THREE.Color(state.solidColor), 1);
    if (apertureMaterial) {
      const rgb = hexToRgb(state.solidColor);
      apertureMaterial.uniforms.uBlinderColor.value.set(rgb.r / 255, rgb.g / 255, rgb.b / 255);
      apertureMaterial.uniforms.uBlinderAlpha.value = 1.0;
      apertureMaterial.uniforms.uBgMode.value = 1;
    }
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
  if (apertureMaterial) {
    apertureMaterial.uniforms.uBlinderAlpha.value = 1.0;
    apertureMaterial.uniforms.uBgMode.value = 2;
    apertureMaterial.uniforms.tBgTexture.value = bgTexture;
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
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

// Requirement 1 & 2: Dynamic Sequence Width & 1:1 Square Slots Atlas
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
  const slotSize = 1024; // Base 1:1 square slot resolution
  const isVerticalMarquee = state.marqueeDirection === 'vertical';

  // Atlas dimensions match sequence flow (Width = count * slotSize or Height = count * slotSize)
  if (!isVerticalMarquee) {
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
      if (!isVerticalMarquee) {
        const x = idx * slotSize;
        drawImageCover(atlasCtx, item.canvas, x + gap / 2, gap / 2, slotSize - gap, slotSize - gap);
      } else {
        const y = idx * slotSize;
        drawImageCover(atlasCtx, item.canvas, gap / 2, y + gap / 2, slotSize - gap, slotSize - gap);
      }
    });
  }

  atlasTexture.dispose();
  atlasTexture = new THREE.CanvasTexture(atlasCanvas);
  configureSharpTexture(atlasTexture);

  if (apertureMaterial) {
    apertureMaterial.uniforms.tDiffuse.value = atlasTexture;
    apertureMaterial.uniforms.uImageCount.value = count;
  }
}

// Kinetic Typography Mode
function renderShapedTypography() {
  atlasCanvas.width = 2048;
  atlasCanvas.height = 2048;
  atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);

  const w = atlasCanvas.width;
  const h = atlasCanvas.height;

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

  const totalLines = rawLines.length;
  const blockHeight = totalLines * lineSpacing;
  const startY = (h - blockHeight) / 2 + lineSpacing / 2;

  rawLines.forEach((line, idx) => {
    const y = startY + idx * lineSpacing;
    atlasCtx.fillText(line, w / 2, y);
  });

  atlasTexture.dispose();
  atlasTexture = new THREE.CanvasTexture(atlasCanvas);
  configureSharpTexture(atlasTexture);

  if (apertureMaterial) {
    apertureMaterial.uniforms.tDiffuse.value = atlasTexture;
    apertureMaterial.uniforms.uImageCount.value = 1.0;
  }
}

// Vertex Shader
const apertureVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  uniform int uIs3D;
  uniform float uCircularArc;
  uniform float uTotalWidth;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 3D Circular Space wrap around cylindrical radius
    if (uIs3D == 1) {
      float radius = uTotalWidth / uCircularArc;
      float theta = (pos.x / uTotalWidth) * uCircularArc;
      pos.x = sin(theta) * radius;
      pos.z = -cos(theta) * radius + radius;
    }

    vWorldPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Requirement 2: Aspect-Fill / Object-Cover Fragment Shader (Eliminates Squeezing/Distortion)
const apertureFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tBgTexture;
  uniform float uImageCount;
  uniform float uOffset;
  uniform int uApertureOrientation; // 0: Horizontal Gates (Left/Right), 1: Vertical Gates (Top/Bottom)
  uniform int uMarqueeDirection;     // 0: Horizontal Flow, 1: Vertical Flow
  uniform int uWrapStyle;            // 0: Hourglass, 1: Arc Lower, 2: Pinch
  uniform float uApertureWidth;      // Translation offset parameter
  uniform float uCurveRadius;        // Fixed curvature radius (R)
  uniform float uCurviness;          // Curviness depth
  uniform vec3 uBlinderColor;
  uniform float uBlinderAlpha;
  uniform int uBgMode;              // 0: Transparent, 1: Solid, 2: Gradient
  uniform float uTotalWidth;
  uniform float uTotalHeight;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vec2 finalUv;

    // 1. Universal Aspect-Fill / Object-Cover Texture Sampling
    if (uMarqueeDirection == 0) {
      // Horizontal Marquee Flow: N 1:1 frames along X
      float uScrolled = fract(vUv.x + uOffset);
      float frameFloat = uScrolled * uImageCount;
      float frameIndex = floor(frameFloat);
      float uLocal = fract(frameFloat);
      float vLocal = vUv.y;

      // Calculate allocated quad aspect ratio on the mesh
      float frameAspect = (uTotalWidth / uImageCount) / uTotalHeight;

      // Apply object-fit: cover around (0.5, 0.5) so pixels never stretch or squash
      vec2 centered = vec2(uLocal - 0.5, vLocal - 0.5);
      if (frameAspect > 1.0) {
        centered.y /= frameAspect;
      } else {
        centered.x *= frameAspect;
      }
      vec2 localCoverUv = clamp(centered + 0.5, 0.0, 1.0);

      float atlasU = (frameIndex + localCoverUv.x) / uImageCount;
      finalUv = vec2(atlasU, localCoverUv.y);
    } else {
      // Vertical Marquee Flow: N 1:1 frames along Y
      float vScrolled = fract(vUv.y + uOffset);
      float frameFloat = vScrolled * uImageCount;
      float frameIndex = floor(frameFloat);
      float vLocal = fract(frameFloat);
      float uLocal = vUv.x;

      float frameAspect = uTotalWidth / (uTotalHeight / uImageCount);

      // Apply object-fit: cover around (0.5, 0.5)
      vec2 centered = vec2(uLocal - 0.5, vLocal - 0.5);
      if (frameAspect > 1.0) {
        centered.y /= frameAspect;
      } else {
        centered.x *= frameAspect;
      }
      vec2 localCoverUv = clamp(centered + 0.5, 0.0, 1.0);

      float atlasV = (frameIndex + localCoverUv.y) / uImageCount;
      finalUv = vec2(localCoverUv.x, atlasV);
    }

    vec4 contentColor = texture2D(tDiffuse, finalUv);

    // 2. Fixed Curvature Aperture Gate Calculations
    float R = max(0.001, uCurveRadius);
    float depth = uCurviness;
    float delta = 0.0;
    float apertureDist = 0.0;

    if (uApertureOrientation == 0) {
      // Horizontal Aperture (Gates translate on X axis, curve varies with Y)
      float y = vWorldPos.y;
      if (uWrapStyle == 0) {
        delta = (y * y) / (2.0 * R) * depth;
      } else if (uWrapStyle == 1) {
        float normY = max(0.0, y + (uTotalHeight * 0.5));
        delta = (normY * normY) / (4.0 * R) * depth;
      } else if (uWrapStyle == 2) {
        delta = depth * R * (1.0 - exp(-(y * y) / (R * R * 0.4)));
      }

      float leftGateX = -uApertureWidth - delta;
      float rightGateX = uApertureWidth + delta;

      float distLeft = vWorldPos.x - leftGateX;
      float distRight = rightGateX - vWorldPos.x;
      apertureDist = min(distLeft, distRight);
    } else {
      // Vertical Aperture (Gates translate on Y axis, curve varies with X)
      float x = vWorldPos.x;
      if (uWrapStyle == 0) {
        delta = (x * x) / (2.0 * R) * depth;
      } else if (uWrapStyle == 1) {
        float normX = max(0.0, x + (uTotalWidth * 0.5));
        delta = (normX * normX) / (4.0 * R) * depth;
      } else if (uWrapStyle == 2) {
        delta = depth * R * (1.0 - exp(-(x * x) / (R * R * 0.4)));
      }

      float bottomGateY = -uApertureWidth - delta;
      float topGateY = uApertureWidth + delta;

      float distBottom = vWorldPos.y - bottomGateY;
      float distTop = topGateY - vWorldPos.y;
      apertureDist = min(distBottom, distTop);
    }

    // Razor-Sharp Subpixel Antialiased Boundary
    float edgeSpan = max(0.0001, fwidth(apertureDist));
    float mask = clamp(apertureDist / edgeSpan + 0.5, 0.0, 1.0);

    vec4 blinderColor;
    if (uBgMode == 2) {
      blinderColor = texture2D(tBgTexture, vUv);
    } else {
      blinderColor = vec4(uBlinderColor, uBlinderAlpha);
    }

    gl_FragColor = mix(blinderColor, contentColor, mask);

    if (gl_FragColor.a < 0.001) discard;
  }
`;

const apertureUniforms = {
  tDiffuse: { value: atlasTexture },
  tBgTexture: { value: bgTexture },
  uOffset: { value: 0.0 },
  uImageCount: { value: 6.0 },
  uApertureOrientation: { value: 0 },
  uMarqueeDirection: { value: 0 },
  uWrapStyle: { value: 0 },
  uApertureWidth: { value: state.apertureWidth },
  uCurveRadius: { value: state.curveRadius },
  uCurviness: { value: state.curviness },
  uBlinderColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
  uBlinderAlpha: { value: 1.0 },
  uBgMode: { value: 1 },
  uIs3D: { value: 0 },
  uCircularArc: { value: (state.circularArc * Math.PI) / 180 },
  uTotalWidth: { value: 1.6 },
  uTotalHeight: { value: 1.6 }
};

let apertureMesh = null;
let apertureMaterial = null;

// Requirement 1 & 4: Mesh Generation (Dynamic Sequence Width without Squeezing)
function buildHourglassMesh() {
  if (apertureMesh) {
    scene.remove(apertureMesh);
    if (apertureMesh.geometry) apertureMesh.geometry.dispose();
  }

  const items = state.mediaItems;
  const count = Math.max(items.length, 1);

  // =========================================================================
  // 🎯 TÙY CHỈNH KÍCH THƯỚC VÀ TỈ LỆ ẢNH TẠI ĐÂY:
  // =========================================================================
  
  // 1. Khi ở [Vertical Aperture + Horizontal Flow]:
  // Muốn ảnh ngắn chiều cao lại (bớt dọc, vuông hơn hoặc lùn hơn):
  // Giảm 'h_vertAperture' xuống (mặc định trước đây bị ép lên 4.2)
  const h_vertAperture = 2.2;  // <-- Chỉnh số này: giảm xuống 2.0, 1.8 hoặc 1.6 để ngắn chiều dài lại

  // 2. Khi ở [Horizontal Aperture + Vertical Flow]:
  // Muốn ảnh có chiều cao dài hơn (bớt dẹt ngang, cao hơn):
  // Tăng 'h_horizAperture' lên hoặc giảm độ rộng 'w_horizAperture'
  const h_horizAperture = 2.6; // <-- Chỉnh số này: tăng lên để kéo dài chiều cao cho mỗi ảnh
  const w_horizAperture = 2.4; // <-- Độ rộng khẩu độ ngang (trước đây bị ép 4.2 nên quá bè ngang)

  // =========================================================================

  let totalWidth, totalHeight;

  if (state.marqueeDirection === 'horizontal') {
    // Luồng ảnh chạy ngang
    const frameW = 1.6; // Chiều rộng mỗi ô ảnh
    totalWidth = count * frameW;
    totalHeight = (state.orientation === 'vertical') ? h_vertAperture : 1.6;
  } else {
    // Luồng ảnh chạy dọc
    const frameH = (state.orientation === 'horizontal') ? h_horizAperture : 1.6;
    totalWidth = (state.orientation === 'horizontal') ? w_horizAperture : 1.6;
    totalHeight = count * frameH;
  }

  // Khởi tạo lưới geometry
  const segX = Math.max(80, Math.round(totalWidth * 20));
  const segY = Math.max(80, Math.round(totalHeight * 20));
  const geometry = new THREE.PlaneGeometry(totalWidth, totalHeight, segX, segY);


  if (!apertureMaterial) {
    apertureMaterial = new THREE.ShaderMaterial({
      uniforms: apertureUniforms,
      vertexShader: apertureVertexShader,
      fragmentShader: apertureFragmentShader,
      side: THREE.DoubleSide,
      transparent: true
    });
  }

  apertureMaterial.uniforms.tDiffuse.value = atlasTexture;
  apertureMaterial.uniforms.tBgTexture.value = bgTexture;
  apertureMaterial.uniforms.uApertureWidth.value = state.apertureWidth;
  apertureMaterial.uniforms.uCurveRadius.value = state.curveRadius;
  apertureMaterial.uniforms.uCurviness.value = state.curviness;
  apertureMaterial.uniforms.uWrapStyle.value =
    state.wrapStyle === 'hourglass' ? 0 : state.wrapStyle === 'arc-lower' ? 1 : 2;
  apertureMaterial.uniforms.uApertureOrientation.value = state.orientation === 'horizontal' ? 0 : 1;
  apertureMaterial.uniforms.uMarqueeDirection.value = state.marqueeDirection === 'horizontal' ? 0 : 1;
  apertureMaterial.uniforms.uIs3D.value = state.spaceMode === '3d' ? 1 : 0;
  apertureMaterial.uniforms.uCircularArc.value = (state.circularArc * Math.PI) / 180;
  apertureMaterial.uniforms.uTotalWidth.value = totalWidth;
  apertureMaterial.uniforms.uTotalHeight.value = totalHeight;
  apertureMaterial.uniforms.uImageCount.value = count;

  updateBackgroundRendering();

  apertureMesh = new THREE.Mesh(geometry, apertureMaterial);
  scene.add(apertureMesh);
}

// Bounding Frame Sizing
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

// Sequence Strip UI
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

// File Uploads
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
      buildHourglassMesh();
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
  updateBackgroundRendering();
  updateTextureAtlas();
};

document.getElementById('btn-toggle-sidebar').onclick = () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  setTimeout(resizePreviewFrame, 220);
};

// Aspect Presets
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

// Play / Pause
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

// Text Inputs
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

// Space Mode
setupSegmented('space-mode-segment', (val) => {
  state.spaceMode = val;
  document.getElementById('row-circular-arc').style.display = val === '3d' ? 'flex' : 'none';
  buildHourglassMesh();
});

// Aperture Axis (Gates along X or Y)
setupSegmented('orientation-segment', (val) => {
  state.orientation = val;
  buildHourglassMesh();
});

// Marquee Direction Controller (Independent Flow along X or Y)
setupSegmented('marquee-direction-segment', (val) => {
  state.marqueeDirection = val;
  updateTextureAtlas();
  buildHourglassMesh();
});

setupSegmented('curve-profile-segment', (val) => {
  state.wrapStyle = val;
  if (apertureMaterial) {
    apertureMaterial.uniforms.uWrapStyle.value =
      val === 'hourglass' ? 0 : val === 'arc-lower' ? 1 : 2;
  }
});

// Aperture Width Slider
const apertureWidthSlider = document.getElementById('param-aperture-width');
if (apertureWidthSlider) {
  apertureWidthSlider.oninput = (e) => {
    state.apertureWidth = parseFloat(e.target.value);
    const lbl = document.getElementById('val-aperture-width');
    if (lbl) lbl.textContent = state.apertureWidth.toFixed(2);
    if (apertureMaterial) {
      apertureMaterial.uniforms.uApertureWidth.value = state.apertureWidth;
    }
  };
}

// Curve Radius Slider
const curveRadiusSlider = document.getElementById('param-curve-radius');
if (curveRadiusSlider) {
  curveRadiusSlider.oninput = (e) => {
    state.curveRadius = parseFloat(e.target.value);
    const lbl = document.getElementById('val-curve-radius');
    if (lbl) lbl.textContent = state.curveRadius.toFixed(2);
    if (apertureMaterial) {
      apertureMaterial.uniforms.uCurveRadius.value = state.curveRadius;
    }
  };
}

// Curviness Depth Slider
const curviInput = document.getElementById('param-curviness');
if (curviInput) {
  curviInput.oninput = (e) => {
    state.curviness = parseFloat(e.target.value);
    const lbl = document.getElementById('val-curviness');
    if (lbl) lbl.textContent = state.curviness.toFixed(2);
    if (apertureMaterial) {
      apertureMaterial.uniforms.uCurviness.value = state.curviness;
    }
  };
}

document.getElementById('param-circular-arc').oninput = (e) => {
  state.circularArc = parseInt(e.target.value);
  document.getElementById('val-circular-arc').textContent = state.circularArc + '°';
  if (apertureMaterial) {
    apertureMaterial.uniforms.uCircularArc.value = (state.circularArc * Math.PI) / 180;
  }
};

document.getElementById('param-subdivisions').oninput = (e) => {
  state.subdivisions = parseInt(e.target.value);
  document.getElementById('val-subdivisions').textContent = state.subdivisions;
  buildHourglassMesh();
};

// Animation
document.getElementById('param-marquee-speed').oninput = (e) => {
  state.autoMarqueeSpeed = parseFloat(e.target.value);
  document.getElementById('val-marquee-speed').textContent = state.autoMarqueeSpeed.toFixed(2);
};

const btnOscillate = document.getElementById('btn-toggle-oscillate');
btnOscillate.onclick = () => {
  state.oscillateCurve = !state.oscillateCurve;
  btnOscillate.firstElementChild.textContent = state.oscillateCurve ? 'Oscillate aperture: On' : 'Oscillate aperture: Off';
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

// Export Management
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
  link.download = `BTS-Route-04-Aperture-${Date.now()}.${exportImgFormat}`;
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
    link.download = `BTS-Route-04-Aperture-${Date.now()}.${exportVidFormat === 'mp4' ? 'mp4' : 'webm'}`;
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
    pLabel.textContent = `Recording (${(elapsed / 1000).toFixed(1)}s / ${exportDuration}s)...`;

    if (elapsed >= totalMs) {
      clearInterval(timer);
      recorder.stop();
    }
  }, 80);
}

// Render Animation Loop
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);
  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (state.isPlaying) {
    state.accumulatedMotion += delta * state.autoMarqueeSpeed * 0.15;
  }

  const totalOffset = (state.accumulatedMotion + state.manualMarqueeOffset) % 1.0;
  if (apertureMaterial) {
    apertureMaterial.uniforms.uOffset.value = totalOffset;
  }

  // Smooth Aperture Breathing Oscillation
  if (state.oscillateCurve) {
    state.oscillationTicker += delta * 2.2;
    const wave = (Math.sin(state.oscillationTicker) + 1.0) / 2.0;
    state.apertureWidth = 0.05 + wave * 0.85;
    const lbl = document.getElementById('val-aperture-width');
    if (lbl) lbl.textContent = state.apertureWidth.toFixed(2);
    if (apertureWidthSlider) apertureWidthSlider.value = state.apertureWidth;
    if (apertureMaterial) {
      apertureMaterial.uniforms.uApertureWidth.value = state.apertureWidth;
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
