import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);

console.log(scene);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// VR Button
document.body.appendChild(VRButton.createButton(renderer));


// Light 1
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // colore bianco, intensità 0.3
scene.add(ambientLight);

// Light 2
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// CREA LUCCIOLE COME PARTICELLE
const fireflyCount = 100;
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyPositions = [];

for (let i = 0; i < fireflyCount; i++) {
  const x = (Math.random() - 0.5) * 10;
  const y = Math.random() * 3 + 1;
  const z = (Math.random() - 0.5) * 10;
  fireflyPositions.push(x, y, z);
}

fireflyGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(fireflyPositions, 3)
);

const fireflyMaterial = new THREE.PointsMaterial({
  color: 0xffffaa,
  size: 0.1,
  transparent: true,
  opacity: 0.8
});

const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x777777 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.position.set(0, 1, -2);
scene.add(cube);

// Cube 2
const cube_2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  cube_2.position.set(5, 5, -4);
  scene.add(cube_2);

// Animate
function animate() {
  cube.rotation.y += 0.01;
  renderer.setAnimationLoop(render);
}

/* =================================================
INTERAZIONE
================================================= */

const raycaster = new THREE.Raycaster();
const interactiveObjects = [];

interactiveObjects.push(cube);

const controller = renderer.xr.getController(0);
scene.add(controller);

function onSelect() {
  const tempMatrix = new THREE.Matrix4();
  tempMatrix.identity().extractRotation(controller.matrixWorld);

  const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
  const origin = controller.position.clone();

  raycaster.set(origin, direction);
  const intersects = raycaster.intersectObjects(interactiveObjects);

  if (intersects.length > 0) {
    intersects[0].object.material.color.set(Math.random() * 0xffffff);
  }
}

controller.addEventListener('select', onSelect);

// 1. CREA IL LASER POINTER (una linea rossa)
const laserGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1) // punta in avanti
  ]);
  
  const laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  
  const laser = new THREE.Line(laserGeometry, laserMaterial);
  laser.name = 'laser';
  laser.scale.z = 10; // lunghezza del laser
  
  // 2. AGGIUNGI IL LASER AL CONTROLLER
  controller.add(laser);


/* =================================================
RENDERER
================================================= */

function render() {
  renderer.render(scene, camera);
}

animate();
