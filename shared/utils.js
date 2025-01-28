window.gltfLoader = new THREE.GLTFLoader();

let gateLoaded = false;
let calLoaded = false;
let ITKLoaded = false
let muonLoaded

let gate1Loaded = false;
let cal1Loaded = false;
let ITK1Loaded = false;
let muon1Loaded

let gate2Loaded = false;
let cal2Loaded = false;
let ITK2Loaded = false;
let muon2Loaded

const LOAD_TIMEOUT = 10000;

let MSGroup = new THREE.Group();
let CGroup = new THREE.Group();
let ITKGroup = new THREE.Group();
let muonGroup = new THREE.Group();

let MSCut1Group = new THREE.Group();
let CCut1Group = new THREE.Group();
let ITKCut1Group = new THREE.Group();
let muonCut1Group = new THREE.Group();

let MSCut2Group = new THREE.Group();
let CCut2Group = new THREE.Group();
let ITKCut2Group = new THREE.Group();
let muonCut2Group = new THREE.Group();


const MSpartFiles = [
  "magnet-toroid-endcap.glb", 
  "magnet-toroid-barrel.glb", 
  "support-btwarm.glb", 
  "support-feet.glb"
];
const CpartFiles = [
  "calorimeter-lar-barrel.glb", 
  "calorimeter-lar-endcap.glb", 
  "calorimeter-tile-barrel.glb", 
  "calorimeter-tile-endcap.glb"
];
const ITKpartFiles = [
  "itk-pixel-inner-barrel-det.glb", 
  "itk-pixel-inner-endcap-det-sidea.glb", 
  "itk-pixel-inner-endcap-det-sidec.glb", 
  "itk-pixel-outer-barrel-det.glb", 
  "itk-pixel-outer-endcap-det-sidea.glb", 
  "itk-pixel-outer-endcap-det-sidec.glb", 
  "itk-strip-barrel-detector.glb", 
  "itk-strip-endcup-detector-sidea.glb", 
  "itk-strip-endcup-detector-sidec.glb"
];
const muonpartFiles = [
  "muon-barrel-inner.glb",
  "muon-barrel-middle.glb",
  "muon-barrel-outer.glb",
  "muon-endcap-bigwheel.glb",
  "muon-endcap-extrawheel.glb",
  "muon-endcap-outerwheel.glb",
  "muon-extra-wheel-sidea.glb",
  "muon-extra-wheel-sidec.glb",
  "muon-extra-wheel.glb",
  "muon-mdt-sidea.glb",
  "muon-mdt-sidec.glb",
  "muon-mdt.glb",
  "muon-outer-wheel-sidea.glb",
  "muon-outer-wheel-sidec.glb",
  "muon-outer-wheel.glb",
  "muon-small-wheel-chambers-sidea.glb",
  "muon-small-wheel-chambers-sidec.glb",
  "muon-small-wheel-chambers.glb",
  "muon-small-wheel-frame-sidea.glb",
  "muon-small-wheel-frame-sidec.glb",
  "muon-small-wheel-frame.glb",
  "muon-small-wheel-hub-sidea.glb",
  "muon-small-wheel-hub-sidec.glb",
  "muon-small-wheel-hub.glb",
  "muon-small-wheel-njd-sidea.glb",
  "muon-small-wheel-njd-sidec.glb",
  "muon-small-wheel-njd.glb",
  "muon-tgc1-sidea.glb",
  "muon-tgc1-sidec.glb",
  "muon-tgc1.glb",
  "muon-tgc2-sidea.glb",
  "muon-tgc2-sidec.glb",
  "muon-tgc2.glb",
  "muon-tgc3-sidea.glb",
  "muon-tgc3-sidec.glb",
  "muon-tgc3.glb"
];

const MSpartCut1Files = [
  "magnet-toroid-barrel-cut2.glb", 
  "magnet-toroid-endcap-cut2.glb", 
  "support-btwarm-cut2.glb", 
  "support-feet-cut2.glb"
];
const CpartCut1Files = [
  "calorimeter-lar-barrel-cut2.glb", 
  "calorimeter-lar-endcap-cut2.glb", 
  "calorimeter-tile-barrel-cut2.glb", 
  "calorimeter-tile-endcap-cut2.glb"
];
const ITKpartCut1Files = [
  "itk-pixel-inner-barrel-det-cut2.glb", 
  "itk-pixel-inner-endcap-det-sidea-cut2.glb", 
  "itk-pixel-inner-endcap-det-sidec-cut2.glb", 
  "itk-pixel-outer-barrel-det-cut2.glb", 
  "itk-pixel-outer-endcap-det-sidea-cut2.glb", 
  "itk-pixel-outer-endcap-det-sidec-cut2.glb", 
  "itk-strip-barrel-detector-cut2.glb", 
  "itk-strip-endcup-detector-sidea-cut2.glb", 
  "itk-strip-endcup-detector-sidec-cut2.glb"
];
const muonpartCut1Files = [
  "muon-barrel-inner-cut2.glb",
  "muon-barrel-middle-cut2.glb",
  "muon-barrel-outer-cut2.glb",
  "muon-extra-wheel-sidea-cut2.glb",
  "muon-extra-wheel-sidec-cut2.glb",
  "muon-extra-wheel-cut2.glb",
  "muon-mdt-sidea-cut2.glb",
  "muon-mdt-sidec-cut2.glb",
  "muon-mdt-cut2.glb",
  "muon-outer-wheel-sidea-cut2.glb",
  "muon-outer-wheel-sidec-cut2.glb",
  "muon-outer-wheel-cut2.glb",
  "muon-small-wheel-chambers-sidea-cut2.glb",
  "muon-small-wheel-chambers-sidec-cut2.glb",
  "muon-small-wheel-chambers-cut2.glb",
  "muon-small-wheel-frame-sidea-cut2.glb",
  "muon-small-wheel-frame-sidec-cut2.glb",
  "muon-small-wheel-frame-cut2.glb",
  "muon-small-wheel-hub-sidea-cut2.glb",
  "muon-small-wheel-hub-sidec-cut2.glb",
  "muon-small-wheel-hub-cut2.glb",
  "muon-small-wheel-njd-sidea-cut2.glb",
  "muon-small-wheel-njd-sidec-cut2.glb",
  "muon-small-wheel-njd-cut2.glb",
  "muon-tgc1-sidea-cut2.glb",
  "muon-tgc1-sidec-cut2.glb",
  "muon-tgc1-cut2.glb",
  "muon-tgc2-sidea-cut2.glb",
  "muon-tgc2-sidec-cut2.glb",
  "muon-tgc2-cut2.glb",
  "muon-tgc3-sidea-cut2.glb",
  "muon-tgc3-sidec-cut2.glb",
  "muon-tgc3-cut2.glb"
];

const MSpartCut2Files = [
  "magnet-toroid-barrel-cut3.glb", 
  "magnet-toroid-endcap-cut3.glb", 
  "support-btwarm-cut3.glb", 
  "support-feet-cut3.glb"
];
const CpartCut2Files = [
  "calorimeter-lar-barrel-cut3.glb", 
  "calorimeter-lar-endcap-cut3.glb", 
  "calorimeter-tile-barrel-cut3.glb", 
  "calorimeter-tile-endcap-cut3.glb"
];
const ITKpartCut2Files = [
  "itk-pixel-inner-barrel-det-cut3.glb", 
  "itk-pixel-inner-endcap-det-sidea-cut3.glb", 
  "itk-pixel-inner-endcap-det-sidec-cut3.glb", 
  "itk-pixel-outer-barrel-det-cut3.glb", 
  "itk-pixel-outer-endcap-det-sidea-cut3.glb", 
  "itk-pixel-outer-endcap-det-sidec-cut3.glb", 
  "itk-strip-barrel-detector-cut3.glb", 
  "itk-strip-endcup-detector-sidea-cut3.glb", 
  "itk-strip-endcup-detector-sidec-cut3.glb"
];

const muonpartCut2Files = [
  "muon-barrel-inner-cut3.glb",
  "muon-barrel-middle-cut3.glb",
  "muon-barrel-outer-cut3.glb",
  "muon-extra-wheel-sidea-cut3.glb",
  "muon-extra-wheel-sidec-cut3.glb",
  "muon-extra-wheel-cut3.glb",
  "muon-mdt-sidea-cut3.glb",
  "muon-mdt-sidec-cut3.glb",
  "muon-mdt-cut3.glb",
  "muon-outer-wheel-sidea-cut3.glb",
  "muon-outer-wheel-sidec-cut3.glb",
  "muon-outer-wheel-cut3.glb",
  "muon-small-wheel-chambers-sidea-cut3.glb",
  "muon-small-wheel-chambers-sidec-cut3.glb",
  "muon-small-wheel-chambers-cut3.glb",
  "muon-small-wheel-frame-sidea-cut3.glb",
  "muon-small-wheel-frame-sidec-cut3.glb",
  "muon-small-wheel-frame-cut3.glb",
  "muon-small-wheel-hub-sidea-cut3.glb",
  "muon-small-wheel-hub-sidec-cut3.glb",
  "muon-small-wheel-hub-cut3.glb",
  "muon-small-wheel-njd-sidea-cut3.glb",
  "muon-small-wheel-njd-sidec-cut3.glb",
  "muon-small-wheel-njd-cut3.glb",
  "muon-tgc1-sidea-cut3.glb",
  "muon-tgc1-sidec-cut3.glb",
  "muon-tgc1-cut3.glb",
  "muon-tgc2-sidea-cut3.glb",
  "muon-tgc2-sidec-cut3.glb",
  "muon-tgc2-cut3.glb",
  "muon-tgc3-sidea-cut3.glb",
  "muon-tgc3-sidec-cut3.glb",
  "muon-tgc3-cut3.glb"
];

let MSloadedParts = 0;
let CloadedParts = 0;
let ITKloadedParts = 0;
let muonloadedParts = 0;

let MSloadedPartsCut1 = 0;
let CloadedPartsCut1 = 0;
let ITKloadedPartsCut1 = 0;
let muonloadedPartsCut1 = 0;

let MSloadedPartsCut2 = 0;
let CloadedPartsCut2 = 0;
let ITKloadedPartsCut2 = 0;
let muonloadedPartsCut2 = 0;


///Magnet System Model Uncut
MSpartFiles.forEach((MSfile, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + MSfile,
    function (gltf) {
      const MSpart = gltf.scene;
      MSGroup.add(MSpart);
      MSloadedParts++;

      // console.log(`Part ${index + 1} of gate model loaded successfully.`);
      if (MSloadedParts === MSpartFiles.length) {
        window.gateModel = MSGroup;
        gateLoaded = true;
        console.log("magnet loaded successfully.");
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
      MSCut1Group.add(MSpartCut1);
      MSloadedPartsCut1++;

      // console.log(`Part ${index + 1} of gate 1 model loaded successfully.`);
      if (MSloadedPartsCut1 === MSpartCut1Files.length) {
        window.gateModelCut1 = MSCut1Group;
        gate1Loaded = true;
        console.log("magnet 1 model loaded successfully.");
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
      MSCut2Group.add(MSpartCut2);
      MSloadedPartsCut2++;

      // console.log(`Part ${index + 1} of gate 2 model loaded successfully.`);
      if (MSloadedPartsCut2 === MSpartCut2Files.length) {
        window.gateModelCut2 = MSCut2Group;
        gate2Loaded = true;
        console.log("magnet 2 model loaded successfully.");
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
      CGroup.add(Cpart);
      CloadedParts++;

      // console.log(`Part ${index + 1} of cal model loaded successfully.`);
      if (CloadedParts === CpartFiles.length) {
        window.calModel = CGroup;
        calLoaded = true;
        console.log("cal model loaded successfully.");
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
      CCut1Group.add(C1part);
      CloadedPartsCut1++;

      // console.log(`Part ${index + 1} of cal 1 model loaded successfully.`);
      if (CloadedPartsCut1 === CpartCut1Files.length) {
        window.calModelCut1 = CCut1Group;
        cal1Loaded = true;
        console.log("cal model 1 loaded successfully.");
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
      CCut2Group.add(C2part);
      CloadedPartsCut2++;

      // console.log(`Part ${index + 1} of cal 2 model loaded successfully.`);
      if (CloadedPartsCut2 === CpartCut2Files.length) {
        window.calModelCut2 = CCut2Group;
        cal2Loaded = true;
        console.log("cal model 2 loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of cal 2 model:`, error);
    }
  );
});

///Muon Model Uncut
muonpartFiles.forEach((muonfile, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + muonfile,
    function (gltf) {
      const muonpart = gltf.scene;
      muonGroup.add(muonpart);
      muonloadedParts++;

      // console.log(`Part ${index + 1} of gate model loaded successfully.`);
      if (muonloadedParts === muonpartFiles.length) {
        window.muonModel = muonGroup;
        muonLoaded = true;
        console.log("muon loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of muon model:`, error);
    }
  );
});

///Muon Model Cut 1
muonpartCut1Files.forEach((muonfile1, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + muonfile1,
    function (gltf) {
      const muonpart1 = gltf.scene;
      muonCut1Group.add(muonpart1);
      muonloadedPartsCut1++;

      // console.log(`Part ${index + 1} of gate model loaded successfully.`);
      if (muonloadedPartsCut1 === muonpartCut1Files.length) {
        window.muonModelCut1 = muonCut1Group;
        muon1Loaded = true;
        console.log("muon cut 1 loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of muon 1 model:`, error);
    }
  );
});

///Muon Model Cut 2
muonpartCut2Files.forEach((muonfile2, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + muonfile2,
    function (gltf) {
      const muonpart2 = gltf.scene;
      muonCut2Group.add(muonpart2);
      muonloadedPartsCut2++;

      // console.log(`Part ${index + 1} of gate model loaded successfully.`);
      if (muonloadedPartsCut2 === muonpartCut2Files.length) {
        window.muonModelCut2 = muonCut2Group;
        muon2Loaded = true;
        console.log("muon cut 2 loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of muon 2 model:`, error);
    }
  );
});

///ITK Model Uncut
ITKpartFiles.forEach((ITKfile, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + ITKfile,
    function (gltf) {
      const ITKpart = gltf.scene;
      ITKGroup.add(ITKpart);
      ITKloadedParts++;

      // console.log(`Part ${index + 1} (${ITKfile}) of ITK model loaded successfully.`);
      if (ITKloadedParts === ITKpartFiles.length) {
        window.ITKModel = ITKGroup;
        ITKLoaded = true;
        console.log("ITK model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of ITK model:`, error);
    }
  );
});

///ITK Model Cut 1
ITKpartCut1Files.forEach((ITKfile1, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + ITKfile1,
    function (gltf) {
      const ITK1part = gltf.scene;
      ITKCut1Group.add(ITK1part);
      ITKloadedPartsCut1++;

      // console.log(`Part ${index + 1} of itk1 model loaded successfully.`);
      if (ITKloadedPartsCut1 === ITKpartCut1Files.length) {
        window.ITKModelCut1 = ITKCut1Group;
        ITK1Loaded = true;
        console.log("ITK Cut 1 model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of ITK 1 model:`, error);
    }
  );
});

///ITK Model Cut 2
ITKpartCut2Files.forEach((ITKfile2, index) => {
  window.gltfLoader.load(
    "https://tracer-geometry.web.cern.ch/" + ITKfile2,
    function (gltf) {
      const ITK2part = gltf.scene;
      ITKCut2Group.add(ITK2part);
      ITKloadedPartsCut2++;

      // console.log(`Part ${index + 1} of itk2 model loaded successfully.`);
      if (ITKloadedPartsCut2 === ITKpartCut2Files.length) {
        window.ITKModelCut2 = ITKCut2Group;
        ITK2Loaded = true;
        console.log("ITK Cut 2 model loaded successfully.");
      }
    },
    undefined,
    function (error) {
      console.error(`Error loading part ${index + 1} of ITK 2 model:`, error);
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