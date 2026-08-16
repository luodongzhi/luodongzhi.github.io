import * as THREE from "three";
import "./style.css";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

function seededRandom(seed = 2026) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function setupInterface() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const links = [...document.querySelectorAll(".site-nav a")];
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const progress = document.querySelector("[data-progress]");
  const railIndex = document.querySelector("[data-index]");
  const railLabel = document.querySelector("[data-label]");
  const reveals = [...document.querySelectorAll(".reveal")];

  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target;
        const id = section.id;
        railIndex.textContent = section.dataset.index;
        railLabel.textContent = section.dataset.chapter;
        links.forEach((link) => link.classList.toggle("is-current", link.hash === `#${id}`));
      });
    },
    { rootMargin: "-42% 0px -48%", threshold: 0 },
  );

  chapters.forEach((chapter) => observer.observe(chapter));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.13 },
  );
  reveals.forEach((element) => revealObserver.observe(element));

  const updateScrollUI = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = available > 0 ? clamp(window.scrollY / available) : 0;
    progress.style.height = `${pageProgress * 100}%`;
    header.classList.toggle("is-scrolled", window.scrollY > 30);
  };

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });
}

function createGrid(size = 24, divisions = 24) {
  const vertices = [];
  const half = size / 2;
  const step = size / divisions;
  for (let i = 0; i <= divisions; i += 1) {
    const offset = -half + i * step;
    vertices.push(-half, 0, offset, half, 0, offset);
    vertices.push(offset, 0, -half, offset, 0, half);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x2c6c70, transparent: true, opacity: 0.16 });
  return new THREE.LineSegments(geometry, material);
}

function createCity(random) {
  const city = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.68, 1, 0.68);
  geometry.translate(0, 0.5, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x163747,
    roughness: 0.72,
    metalness: 0.08,
    transparent: true,
    opacity: 0.9,
  });

  const placements = [];
  for (let x = -7; x <= 7; x += 1) {
    for (let z = -7; z <= 7; z += 1) {
      const radius = Math.hypot(x, z);
      if (radius < 2.1 || radius > 8.8 || random() < 0.12) continue;
      placements.push({ x, z, radius, height: 0.25 + random() * 2.4 * (1 - radius / 13) });
    }
  }

  const buildings = new THREE.InstancedMesh(geometry, material, placements.length);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  placements.forEach((item, index) => {
    dummy.position.set(item.x * 0.95 + (random() - 0.5) * 0.18, 0, item.z * 0.95 + (random() - 0.5) * 0.18);
    dummy.scale.set(0.55 + random() * 0.35, item.height, 0.55 + random() * 0.35);
    dummy.rotation.y = random() * 0.16;
    dummy.updateMatrix();
    buildings.setMatrixAt(index, dummy.matrix);
    color.set(item.height > 1.8 ? 0x61d9d0 : item.radius < 4 ? 0x4f8d75 : 0x183b4b);
    buildings.setColorAt(index, color);
  });
  buildings.instanceMatrix.needsUpdate = true;
  if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;
  city.add(buildings);

  const streetGrid = createGrid(17, 18);
  streetGrid.position.y = 0.015;
  city.add(streetGrid);
  return city;
}

function createCognitiveCore() {
  const group = new THREE.Group();
  const solid = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.42, 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x5cbcb7,
      emissive: 0x0a3138,
      emissiveIntensity: 0.9,
      roughness: 0.28,
      metalness: 0.25,
      transparent: true,
      opacity: 0.42,
    }),
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.62, 1),
    new THREE.MeshBasicMaterial({ color: 0xb6f56a, wireframe: true, transparent: true, opacity: 0.38 }),
  );
  group.add(solid, shell);

  [2.25, 2.85, 3.55].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.012 + index * 0.004, 8, 160),
      new THREE.MeshBasicMaterial({
        color: index === 1 ? 0xb6f56a : 0x61d9d0,
        transparent: true,
        opacity: 0.34 - index * 0.06,
      }),
    );
    ring.rotation.set(Math.PI / 2 + index * 0.46, index * 0.32, index * 0.2);
    ring.userData.speed = 0.035 + index * 0.014;
    group.add(ring);
  });

  return group;
}

function createMobilityNetwork(random) {
  const network = new THREE.Group();
  const nodePositions = [];
  const linePositions = [];
  const palette = [0x61d9d0, 0xb6f56a, 0xffbf69];

  for (let route = 0; route < 6; route += 1) {
    const points = [];
    const phase = random() * Math.PI * 2;
    for (let i = 0; i < 42; i += 1) {
      const t = i / 41;
      const radius = 2.2 + t * 6.5 + Math.sin(t * 8 + phase) * 0.55;
      const angle = phase + t * (Math.PI * 1.45 + route * 0.12);
      const point = new THREE.Vector3(
        Math.cos(angle) * radius,
        0.2 + Math.sin(t * Math.PI * 3 + phase) * 0.38,
        Math.sin(angle) * radius,
      );
      points.push(point);
      if (i % 5 === 0) nodePositions.push(point.x, point.y, point.z);
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(140);
    for (let i = 0; i < curvePoints.length - 1; i += 1) {
      linePositions.push(
        curvePoints[i].x, curvePoints[i].y, curvePoints[i].z,
        curvePoints[i + 1].x, curvePoints[i + 1].y, curvePoints[i + 1].z,
      );
    }

    const traveller = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 12),
      new THREE.MeshBasicMaterial({ color: palette[route % palette.length] }),
    );
    traveller.userData.curve = curve;
    traveller.userData.offset = random();
    traveller.userData.speed = 0.028 + random() * 0.02;
    network.add(traveller);
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  network.add(
    new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: 0x61d9d0, transparent: true, opacity: 0.16 }),
    ),
  );

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
  network.add(
    new THREE.Points(
      nodeGeometry,
      new THREE.PointsMaterial({ color: 0xb6f56a, size: 0.07, transparent: true, opacity: 0.8, sizeAttenuation: true }),
    ),
  );

  return network;
}

function setupThreeScene() {
  const canvas = document.querySelector("#webgl");
  const random = seededRandom(462);
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (error) {
    console.warn("WebGL is unavailable; using the CSS fallback.", error);
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07111e, 0.048);
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(8.5, 5.6, 14);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const world = new THREE.Group();
  const city = createCity(random);
  const core = createCognitiveCore();
  const network = createMobilityNetwork(random);
  city.position.y = -2.3;
  core.position.y = 0.55;
  network.position.y = -1.85;
  world.add(city, core, network);
  scene.add(world);

  scene.add(new THREE.HemisphereLight(0x9cded7, 0x07111e, 1.5));
  const keyLight = new THREE.DirectionalLight(0xb6f56a, 2.5);
  keyLight.position.set(5, 9, 7);
  scene.add(keyLight);
  const cyanLight = new THREE.PointLight(0x61d9d0, 12, 24, 2);
  cyanLight.position.set(-5, 2, 4);
  scene.add(cyanLight);

  const dustCount = window.innerWidth < 700 ? 450 : 900;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const radius = 9 + random() * 18;
    const angle = random() * Math.PI * 2;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = (random() - 0.5) * 14;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: 0x8dbbb3, size: 0.025, transparent: true, opacity: 0.42 }),
  );
  scene.add(dust);

  const pointer = new THREE.Vector2();
  let scrollTarget = 0;
  let scrollCurrent = 0;
  let lastTime = performance.now();

  const cameraFrames = [
    { p: [8.5, 5.6, 14], l: [0, -0.2, 0], r: [0, 0, 0] },
    { p: [10, 4, 10], l: [0, -0.6, 0], r: [0.06, 0.7, 0] },
    { p: [3.5, 9.5, 11], l: [0, -1.1, 0], r: [0.18, 1.45, 0] },
    { p: [-9, 4.8, 11], l: [0, -0.8, 0], r: [0.08, 2.35, 0] },
    { p: [-7, 2.4, 13.5], l: [0, 0.2, 0], r: [-0.08, 3.1, 0] },
    { p: [1.5, 11.5, 10], l: [0, -1.2, 0], r: [0.28, 3.8, 0] },
    { p: [9.5, 3, 12], l: [0, 0, 0], r: [0.02, 4.7, 0] },
  ];

  const updateScrollTarget = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = available > 0 ? clamp(window.scrollY / available) : 0;
  };

  const updateCamera = () => {
    const scaled = scrollCurrent * (cameraFrames.length - 1);
    const fromIndex = Math.min(cameraFrames.length - 2, Math.floor(scaled));
    const t = scaled - fromIndex;
    const eased = t * t * (3 - 2 * t);
    const from = cameraFrames[fromIndex];
    const to = cameraFrames[fromIndex + 1];

    camera.position.set(
      lerp(from.p[0], to.p[0], eased) + pointer.x * 0.45,
      lerp(from.p[1], to.p[1], eased) + pointer.y * 0.3,
      lerp(from.p[2], to.p[2], eased),
    );
    world.rotation.set(
      lerp(from.r[0], to.r[0], eased),
      lerp(from.r[1], to.r[1], eased),
      lerp(from.r[2], to.r[2], eased),
    );
    camera.lookAt(
      lerp(from.l[0], to.l[0], eased),
      lerp(from.l[1], to.l[1], eased),
      lerp(from.l[2], to.l[2], eased),
    );
  };

  const animate = (now) => {
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    scrollCurrent = reducedMotion ? scrollTarget : lerp(scrollCurrent, scrollTarget, 0.055);
    updateCamera();

    if (!reducedMotion) {
      core.children[0].rotation.y += delta * 0.13;
      core.children[1].rotation.x -= delta * 0.08;
      core.children.slice(2).forEach((ring) => {
        ring.rotation.z += delta * ring.userData.speed;
      });
      network.children.forEach((child) => {
        if (!child.userData.curve) return;
        child.userData.offset = (child.userData.offset + delta * child.userData.speed) % 1;
        child.position.copy(child.userData.curve.getPointAt(child.userData.offset));
      });
      dust.rotation.y += delta * 0.004;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  window.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  window.addEventListener("scroll", updateScrollTarget, { passive: true });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  canvas.addEventListener("webglcontextlost", () => document.body.classList.remove("webgl-ready"));
  updateScrollTarget();
  updateCamera();
  document.body.classList.add("webgl-ready");
  requestAnimationFrame(animate);
}

setupInterface();
setupThreeScene();
