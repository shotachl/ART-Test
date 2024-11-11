window.gltfLoader = new THREE.GLTFLoader();

let toroidLoadingStarted = false;
let gateLoadingStarted = false;
let toroidLoaded = false;
let gateLoaded = false;
let toroidLoadStartTime = null;
let gateLoadStartTime = null;
const LOAD_TIMEOUT = 10000;

let frameCount = 0;
let lastTime = Date.now();
let fps = 0;

console.log("Attempting to load toroid model...");
window.gltfLoader.load("toroid_scene.gltf",
  function (gltf) {
    window.toroidModel = gltf.scene;
    toroidLoaded = true;
    const loadDuration = Date.now() - toroidLoadStartTime;
    console.log(`Model1 (toroid) loaded successfully in ${loadDuration} ms:`, window.toroidModel);
  },
  function () {
    if (!toroidLoadingStarted) {
      toroidLoadingStarted = true;
      toroidLoadStartTime = Date.now();
      console.log("Model1 (toroid) loading started...");
    }
  },
  function (error) {
    console.error("Error loading Model1 (toroid):", error);
  }
);

// console.log("Attempting to load gate model...");
// window.gltfLoader.load("https://tracer-geometry.web.cern.ch/magnet-toroid-barrel.glb",
//   function (gltf) {
//     window.gateModel = gltf.scene;
//     gateLoaded = true;
//     const loadDuration = Date.now() - gateLoadStartTime;
//     console.log(`Model2 (gate) loaded successfully in ${loadDuration} ms:`, window.gateModel);
//   },
//   function () {
//     if (!gateLoadingStarted) {
//       gateLoadingStarted = true;
//       gateLoadStartTime = Date.now();
//       console.log("Model2 (gate) loading started...");
//     }
//   },
//   function (error) {
//     console.error("Error loading Model2 (gate):", error);
//   }
// );

console.log("Attempting to load gate model directly from URL...");
window.gltfLoader.load("https://cors-anywhere.herokuapp.com/https://tracer-geometry.web.cern.ch/magnet-toroid-barrel.glb",
  function (gltf) {
    window.gateModel = gltf.scene;
    gateLoaded = true;
    const loadDuration = Date.now() - gateLoadStartTime;
    console.log(`Model2 (gate) loaded successfully in ${loadDuration} ms:`, window.gateModel);
  },
  function () {
    if (!gateLoadingStarted) {
      gateLoadingStarted = true;
      gateLoadStartTime = Date.now();
      console.log("Model2 (gate) loading started...");
    }
  },
  function (error) {
    console.error("Error loading Model2 (gate):", error);
  }
);



setTimeout(() => {
  if (toroidLoadingStarted && !toroidLoaded) {
    console.warn("Model1 (toroid) loading was started but appears to be cancelled or delayed.");
  }
  if (gateLoadingStarted && !gateLoaded) {
    console.warn("Model2 (gate) loading was started but appears to be cancelled or delayed.");
  }
  if (!toroidLoaded) {
    console.warn("Model1 (toroid) may not have loaded. Check connection or file path.");
  }
  if (!gateLoaded) {
    console.warn("Model2 (gate) may not have loaded. Check connection or file path.");
  }
}, LOAD_TIMEOUT);

function animate() {
  requestAnimationFrame(animate);

  // Example: renderer.render(scene, camera);

  frameCount++;

  const currentTime = Date.now();
  if (currentTime - lastTime >= 1000) { 
    fps = frameCount; 
    document.getElementById('fpsCounter').innerText = `FPS: ${fps}`;
    frameCount = 0; 
    lastTime = currentTime; 
  }
}

// Start the animation loop
animate();

// Reticle class
class Reticle extends THREE.Object3D {
  constructor() {
    super();

    this.loader = new THREE.GLTFLoader();
    this.loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
      this.add(gltf.scene);
    });

    this.visible = false;
  }
}

window.DemoUtils = {
  createCubeScene() {
    const scene = new THREE.Scene();
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
      new THREE.MeshBasicMaterial({ color: 0x0000ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
      new THREE.MeshBasicMaterial({ color: 0xff00ff }),
      new THREE.MeshBasicMaterial({ color: 0x00ffff }),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    ];

    const ROW_COUNT = 4;
    const SPREAD = 1;
    const HALF = ROW_COUNT / 2;
    for (let i = 0; i < ROW_COUNT; i++) {
      for (let j = 0; j < ROW_COUNT; j++) {
        for (let k = 0; k < ROW_COUNT; k++) {
          const box = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), materials);
          box.position.set(i - HALF, j - HALF, k - HALF);
          box.position.multiplyScalar(SPREAD);
          scene.add(box);
        }
      }
    }

    return scene;
  },

  createLitScene() {
    const scene = new THREE.Scene();
    const light = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;

    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
      color: 0x111111,
      opacity: 0.2,
    }));
    shadowMesh.name = 'shadowMesh';
    shadowMesh.receiveShadow = true;
    shadowMesh.position.y = 10000;

    scene.add(shadowMesh);
    scene.add(light);
    scene.add(directionalLight);

    return scene;
  }
};

function onNoXRDevice() {
  document.body.classList.add('unsupported');
}
