import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.6, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Luci
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

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

// Oggetto interattivo (cubo)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
cube.position.set(0, .5, -2);
scene.add(cube);

// Raycaster e oggetti interattivi
const raycaster = new THREE.Raycaster();
const interactiveObjects = [cube];

// Controller e laser pointer
const controller = renderer.xr.getController(0);
scene.add(controller);

// Laser visivo
const laserGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -1)
]);
const laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const laser = new THREE.Line(laserGeometry, laserMaterial);
laser.name = 'laser';
laser.scale.z = 10;
controller.add(laser);

// Interazione con trigger
controller.addEventListener('select', () => {
  const tempMatrix = new THREE.Matrix4().identity().extractRotation(controller.matrixWorld);
  const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
  const origin = controller.position.clone();

  raycaster.set(origin, direction);
  const intersects = raycaster.intersectObjects(interactiveObjects);

  if (intersects.length > 0) {
    intersects[0].object.material.color.set(Math.random() * 0xffffff);
  }
});

// Animazione
renderer.setAnimationLoop(() => {
  // Laser dynamic color if hitting
  const tempMatrix = new THREE.Matrix4().identity().extractRotation(controller.matrixWorld);
  const direction = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix);
  const origin = controller.position.clone();

  raycaster.set(origin, direction);
  const intersects = raycaster.intersectObjects(interactiveObjects);

  if (intersects.length > 0) {
    laser.material.color.set(0x00ff00);
  } else {
    laser.material.color.set(0xff0000);
  }

  renderer.render(scene, camera);
});
