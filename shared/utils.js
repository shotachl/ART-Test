window.gltfLoader = new THREE.GLTFLoader();

let toroidLoadingStarted = false;
let gateLoadingStarted = false;
let calLoadingStarted = false;
let toroidLoaded = false;
let gateLoaded = false;
let calLoaded = false;
let gate1Loaded = false;
let cal1Loaded = false;
let gate2Loaded = false;
let cal2Loaded = false;
let toroidLoadStartTime = null;
let gateLoadStartTime = null;
let calLoadStartTime = null;
const LOAD_TIMEOUT = 10000;

let MSgateGroup = new THREE.Group();
let CgateGroup = new THREE.Group();

let MSgateCut1Group = new THREE.Group();
let CgateCut1Group = new THREE.Group();

let MSgateCut2Group = new THREE.Group();
let CgateCut2Group = new THREE.Group();


const MSpartFiles = ["magnet-toroid-endcap.glb", "muon-barrel-inner.glb", "support-btwarm.glb", "support-feet.glb"];
const CpartFiles = ["calorimeter-lar-barrel.glb", "calorimeter-lar-endcap.glb", "calorimeter-tile-barrel.glb", "calorimeter-tile-endcap.glb"];

const MSpartCut1Files = ["magnet-toroid-barrel-cut-2.glb", "magnet-toroid-endcap-cut-2.glb", "support-btwarm-cut-2.glb", "support-feet-cut-2.glb"];
const CpartCut1Files = ["calorimeter-lar-barrel-cut-2.glb", "calorimeter-lar-endcap-cut-2.glb", "calorimeter-tile-barrel-cut-2.glb", "calorimeter-tile-endcap-cut-2.glb"];

const MSpartCut2Files = ["magnet-toroid-barrel-cut-3.glb", "magnet-toroid-endcap-cut-3.glb", "support-btwarm-cut-3.glb", "support-feet-cut-3.glb"];
const CpartCut2Files = ["calorimeter-lar-barrel-cut-3.glb", "calorimeter-lar-endcap-cut-3.glb", "calorimeter-tile-barrel-cut-3.glb", "calorimeter-tile-endcap-cut-3.glb"];


let MSloadedParts = 0;
let CloadedParts = 0;

let MSloadedPartsCut1 = 0;
let CloadedPartsCut1 = 0;

let MSloadedPartsCut2 = 0;
let CloadedPartsCut2 = 0;

///Magnet System Model Uncut
MSpartFiles.forEach((MSfile, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + MSfile,
    function (gltf) {
      const MSpart = gltf.scene;
      MSgateGroup.add(MSpart);
      MSloadedParts++;

      // console.log(`Part ${index + 1} of gate model loaded successfully.`);
      if (MSloadedParts === MSpartFiles.length) {
        window.gateModel = MSgateGroup;
        gateLoaded = true;
        console.log("All parts of gate model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of gate model:`, error);
    }
  );
});

///Magnet System Model Cut 1
MSpartCut1Files.forEach((MSfileCut1, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + MSfileCut1,
    function (gltf) {
      const MSpartCut1 = gltf.scene;
      MSgateCut1Group.add(MSpartCut1);
      MSloadedPartsCut1++;

      // console.log(`Part ${index + 1} of gate 1 model loaded successfully.`);
      if (MSloadedPartsCut1 === MSpartCut1Files.length) {
        window.gateModelCut1 = MSgateCut1Group;
        gate1Loaded = true;
        console.log("All parts of gate 1 model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of gate 1 model:`, error);
    }
  );
});

///Magnet System Model Cut 2
MSpartCut2Files.forEach((MSfileCut2, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + MSfileCut2,
    function (gltf) {
      const MSpartCut2 = gltf.scene;
      MSgateCut2Group.add(MSpartCut2);
      MSloadedPartsCut2++;

      // console.log(`Part ${index + 1} of gate 2 model loaded successfully.`);
      if (MSloadedPartsCut2 === MSpartCut2Files.length) {
        window.gateModelCut2 = MSgateCut2Group;
        gate2Loaded = true;
        console.log("All parts of gate 2 model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of gate 2 model:`, error);
    }
  );
});

///Calorimeter Model Uncut
CpartFiles.forEach((Cfile, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + Cfile,
    function (gltf) {
      const Cpart = gltf.scene;
      CgateGroup.add(Cpart);
      CloadedParts++;

      // console.log(`Part ${index + 1} of cal model loaded successfully.`);
      if (CloadedParts === CpartFiles.length) {
        window.calModel = CgateGroup;
        calLoaded = true;
        console.log("All parts of cal model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of cal model:`, error);
    }
  );
});

///Calorimeter Model Cut 1
CpartCut1Files.forEach((Cfile1, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + Cfile1,
    function (gltf) {
      const C1part = gltf.scene;
      CgateCut1Group.add(C1part);
      CloadedPartsCut1++;

      // console.log(`Part ${index + 1} of cal 1 model loaded successfully.`);
      if (CloadedPartsCut1 === CpartCut1Files.length) {
        window.calModelCut1 = CgateCut1Group;
        cal1Loaded = true;
        console.log("All parts of cal model 1 loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of cal 1 model:`, error);
    }
  );
});

///Calorimeter Model Cut 2
CpartCut2Files.forEach((Cfile2, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + Cfile2,
    function (gltf) {
      const C2part = gltf.scene;
      CgateCut2Group.add(C2part);
      CloadedPartsCut2++;

      // console.log(`Part ${index + 1} of cal 2 model loaded successfully.`);
      if (CloadedPartsCut2 === CpartCut2Files.length) {
        window.calModelCut2 = CgateCut2Group;
        cal2Loaded = true;
        console.log("All parts of cal model 2 loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of cal 2 model:`, error);
    }
  );
});

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
