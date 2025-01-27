(async function() {
  const isArSessionSupported = navigator.xr && navigator.xr.isSessionSupported && await navigator.xr.isSessionSupported("immersive-ar");
  document.querySelector(".hex.pos0").style.display = "none";
  document.querySelector(".hex.reset").style.display = "none";
  document.querySelectorAll(".hex.pos1, .hex.pos2, .hex.pos3, .hex.pos4, .hex.pos8, .hex.pos9, .hex.pos10").forEach(hex => hex.classList.toggle('hidden'));
  if (isArSessionSupported) {
    document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)
  } else {
    onNoXRDevice();
  }
})();

let clicks = 0;

class App {
  constructor() {
    this.sharedRotation = new THREE.Euler();
    this.sharedScale = new THREE.Vector3(0.01, 0.01, 0.01);
    this.firstObjectPosition = null;
    this.hasObjects = false;
    this.currentCutState = 'uncut'; 

    this.originalMGNT = window.gateModel;
    this.originalCal = window.calModel;
    this.originalMuon = window.muonModel;
    this.originalITK = window.ITKModel;

    this.MGNT = this.originalMGNT;
    this.Cal = this.originalCal;
    this.ITK = this.originalITK;
    this.Muon = this.originalMuon;

    this.MGNTCut1 = window.gateModelCut1;
    this.MGNTCut2 = window.gateModelCut2;
    this.CalCut1 = window.calModelCut1;
    this.CalCut2 = window.calModelCut2;
    this.MuonCut1 = window.muonModelCut1;
    this.MuonCut2 = window.muonModelCut2;
    this.ITKCut1 = window.ITKModelCut1;
    this.ITKCut2 = window.ITKModelCut2;

    // this.logOutput = document.getElementById('logOutput');
    // const originalLog = console.log;
    // console.log = (...args) => {
    //   originalLog.apply(console, args);
    //   const message = args.join(' ');
    //   const logElement = document.createElement('div');
    //   logElement.textContent = message;
    //   this.logOutput.appendChild(logElement);
    //   this.logOutput.scrollTop = this.logOutput.scrollHeight;
    // };
  }

  setupThreeJs() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: this.gl
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = DemoUtils.createLitScene();
    this.reticle = new Reticle();
    this.scene.add(this.reticle);
    this.touchX;
    this.buttonClicked = false;
    this.hexClicked = true;
    this.button = document.querySelector(".hex.reset");
    this.otherHexes = document.querySelectorAll(".hex.pos1, .hex.pos2, .hex.pos3, .hex.pos4, .hex.pos8, .hex.pos9, .hex.pos10");
    this.hex0 = document.querySelector(".hex.pos0");
    this.hex1 = document.querySelector(".hex.pos1");
    this.hex2 = document.querySelector(".hex.pos2");
    this.hex3 = document.querySelector(".hex.pos3");
    this.hex4 = document.querySelector(".hex.pos4");
    this.cut1 = document.querySelector(".hex.pos8");
    this.cut2 = document.querySelector(".hex.pos9");
    this.uncut = document.querySelector(".hex.pos10");
    this.logOutPut = document.getElementById("logOutput");
    this.originalLog = console.log;
    this.CalisSelected = false;
    this.MGNTisSelected = false;
    this.ITKisSelected = false;
    this.MuonisSelected = false;

    this.camera = new THREE.PerspectiveCamera();
    this.camera.matrixAutoUpdate = false;

    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
    this.button.addEventListener('click', this.onButtonClick);  
    this.hex0.addEventListener('click', this.onHexClick);

    this.hex1.addEventListener('click', this.onMGNT);
    this.hex2.addEventListener('click', this.onCal);
    this.hex3.addEventListener('click', this.onITK);
    this.hex4.addEventListener('click', this.onMuon);

    this.cut1.addEventListener('click', (event) => {
      event.stopPropagation();
      this.cycleCutState('cut1');
    });
    this.cut2.addEventListener('click', (event) => {
      event.stopPropagation();
      this.cycleCutState('cut2');
    });
    this.uncut.addEventListener('click', (event) => {
      event.stopPropagation();
      this.cycleCutState('uncut');
    });

    this.otherHexes.forEach(hex => hex.classList.toggle('hidden'));
    this.hex0.style.display = "inline-block";
    this.button.style.display = "inline-block";

    this.updateCutButtonStyles();
  }

  onTouchStart = (event) => {
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
    }
  
    const touch = event.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
  };

  onTouchMove = (event) => {
    const spawnedModels = [];
    if (this.MGNTisSelected) spawnedModels.push(this.MGNT);
    if (this.CalisSelected) spawnedModels.push(this.Cal);
    if (this.ITKisSelected) spawnedModels.push(this.ITK);
    if (this.MuonisSelected) spawnedModels.push(this.Muon);
  
    if (spawnedModels.length === 0) return;
  
    const touch = event.changedTouches[0];
    const currentTouchX = touch.clientX;
    const currentTouchY = touch.clientY;
    const deltaX = currentTouchX - (this.touchX || currentTouchX);
    const deltaY = currentTouchY - (this.touchY || currentTouchY);
  
    this.sharedRotation.y += deltaX * 0.01;
    this.sharedRotation.x += deltaY * 0.01;
  
    spawnedModels.forEach(model => {
      model.rotation.copy(this.sharedRotation);
    });
  
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: currentTouchX,
      clientY: currentTouchY
    });
  
    this.renderer.domElement.dispatchEvent(mouseEvent);
  
    if (event.touches.length === 2 && this.touchStartDistance) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const touchDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = touchDistance / this.touchStartDistance;
  
      this.sharedScale.multiplyScalar(scaleFactor);
  
      spawnedModels.forEach(model => {
        model.scale.copy(this.sharedScale);
      });
  
      this.touchStartDistance = touchDistance;
    }
  
    this.touchX = currentTouchX;
    this.touchY = currentTouchY;
  };

  onTouchEnd = (event) => {
    if (event.touches.length < 2) {
      this.touchStartDistance = null;
    }
  
    this.touchX = null;
    this.touchY = null;
  };

  onButtonClick = (event) => {
    this.buttonClicked = true;
    event.stopPropagation();
  
    this.scene.remove(this.MGNT);
    this.scene.remove(this.Cal);
    this.scene.remove(this.Muon);
    this.scene.remove(this.ITK);
  
    this.hex1.style.backgroundImage = "url('./shared/hex.png')";
    this.hex2.style.backgroundImage = "url('./shared/hex.png')";
    this.hex3.style.backgroundImage = "url('./shared/hex.png')";
    this.hex4.style.backgroundImage = "url('./shared/hex.png')";
  
    this.MGNTisSelected = false;
    this.CalisSelected = false;
    this.ITKisSelected = false;
    this.MuonisSelected = false;
  
    this.updateObjectState();
  };

  onHexClick = (event) => {
    event.stopPropagation();
    this.hexClicked = false;
    this.otherHexes.forEach(hex => hex.classList.toggle('hidden'));

    this.hex0.classList.toggle('filled');
  };

  onMGNT = () => {
    if (this.MGNTisSelected) {
      this.hex1.style.backgroundImage = "url('./shared/hex.png')";
      this.scene.remove(this.MGNT);
      this.MGNTisSelected = false;
      this.updateObjectState();
    } else {
      this.hex1.style.backgroundImage = "url('./shared/filledHex.png')";
  
      if (!this.firstObjectPosition) {
        this.firstObjectPosition = this.reticle.position.clone(); 
        this.reticle.visible = false; 
      }
  
      let modelToAdd;
      switch (this.currentCutState) {
        case 'cut1':
          modelToAdd = this.MGNTCut1;
          break;
        case 'cut2':
          modelToAdd = this.MGNTCut2;
          break;
        default: 
          modelToAdd = this.MGNT;
          break;
      }
  
      modelToAdd.position.copy(this.firstObjectPosition);
      modelToAdd.rotation.copy(this.sharedRotation);
      modelToAdd.scale.copy(this.sharedScale);
  
      this.scene.add(modelToAdd);
      this.MGNTisSelected = true;
      this.hasObjects = true; 

      this.updateCutButtonStyles();
      this.updateDeleteButtonStyle();
    }
  };

  onCal = () => {
    if (this.CalisSelected) {
      this.hex2.style.backgroundImage = "url('./shared/hex.png')";
      this.scene.remove(this.Cal);
      this.CalisSelected = false;
      this.updateObjectState(); 
    } else {
      this.hex2.style.backgroundImage = "url('./shared/filledHex.png')";
  
      if (!this.firstObjectPosition) {
        this.firstObjectPosition = this.reticle.position.clone(); 
        this.reticle.visible = false; 
      }
  
      let modelToAdd;
      switch (this.currentCutState) {
        case 'cut1':
          modelToAdd = this.CalCut1;
          break;
        case 'cut2':
          modelToAdd = this.CalCut2;
          break;
        default: 
          modelToAdd = this.Cal;
          break;
      }
  
      modelToAdd.position.copy(this.firstObjectPosition);
      modelToAdd.rotation.copy(this.sharedRotation);
      modelToAdd.scale.copy(this.sharedScale);
  
      this.scene.add(modelToAdd);
      this.CalisSelected = true;
      this.hasObjects = true; 

      this.updateCutButtonStyles();
      this.updateDeleteButtonStyle();
    }
  };
  
  onITK = () => {
    if (this.ITKisSelected) {
      this.hex3.style.backgroundImage = "url('./shared/hex.png')";
      this.scene.remove(this.ITK);
      this.ITKisSelected = false;
      this.updateObjectState(); 
    } else {
      this.hex3.style.backgroundImage = "url('./shared/filledHex.png')";
  
      if (!this.firstObjectPosition) {
        this.firstObjectPosition = this.reticle.position.clone(); 
        this.reticle.visible = false; 
      }
  
      let modelToAdd;
      switch (this.currentCutState) {
        case 'cut1':
          modelToAdd = this.ITKCut1;
          break;
        case 'cut2':
          modelToAdd = this.ITKCut2;
          break;
        default: 
          modelToAdd = this.ITK;
          break;
      }
  
      modelToAdd.position.copy(this.firstObjectPosition);
      modelToAdd.rotation.copy(this.sharedRotation);
      modelToAdd.scale.copy(this.sharedScale);
  
      this.scene.add(modelToAdd);
      this.ITKisSelected = true;
      this.hasObjects = true;

      this.updateCutButtonStyles();
      this.updateDeleteButtonStyle();
    }
  };
  
  onMuon = () => {
    if (this.MuonisSelected) {
      this.hex4.style.backgroundImage = "url('./shared/hex.png')";
      this.scene.remove(this.Muon);
      this.MuonisSelected = false;
      this.updateObjectState(); 
    } else {
      this.hex4.style.backgroundImage = "url('./shared/filledHex.png')";
  
      if (!this.firstObjectPosition) {
        this.firstObjectPosition = this.reticle.position.clone(); 
        this.reticle.visible = false; 
      }
  
      let modelToAdd;
      switch (this.currentCutState) {
        case 'cut1':
          modelToAdd = this.MuonCut1;
          break;
        case 'cut2':
          modelToAdd = this.MuonCut2;
          break;
        default:
          modelToAdd = this.Muon;
          break;
      }
  
      modelToAdd.position.copy(this.firstObjectPosition);
      modelToAdd.rotation.copy(this.sharedRotation);
      modelToAdd.scale.copy(this.sharedScale);
  
      this.scene.add(modelToAdd);
      this.MuonisSelected = true;
      this.hasObjects = true; 

      this.updateCutButtonStyles();
      this.updateDeleteButtonStyle();
    }
  };

  updateObjectState = () => {
    const hasObjects = this.MGNTisSelected || this.CalisSelected || this.ITKisSelected || this.MuonisSelected;
    if (!hasObjects) {
      this.firstObjectPosition = null; 
      this.reticle.visible = true;
      this.hasObjects = false; 
  
      this.updateCutButtonStyles();
    }
  };

  cycleCutState = (cutState) => {
    this.currentCutState = cutState;
  
    if (this.MGNTisSelected) this.updateModelCutState(this.MGNT, this.MGNTCut1, this.MGNTCut2);
    if (this.CalisSelected) this.updateModelCutState(this.Cal, this.CalCut1, this.CalCut2);
    if (this.ITKisSelected) this.updateModelCutState(this.ITK, this.ITKCut1, this.ITKCut2);
    if (this.MuonisSelected) this.updateModelCutState(this.Muon, this.MuonCut1, this.MuonCut2);
  
    this.updateCutButtonStyles();
  };
  
  updateModelCutState = (model, cut1Model, cut2Model) => {
    const position = model.position.clone();
    const rotation = this.sharedRotation.clone(); 
    const scale = this.sharedScale.clone();
  
    this.scene.remove(model);
  
    let newModel;
    switch (this.currentCutState) {
      case 'cut1':
        newModel = cut1Model;
        break;
      case 'cut2':
        newModel = cut2Model;
        break;
      default: 
        if (model === this.MGNT) newModel = this.originalMGNT;
        else if (model === this.Cal) newModel = this.originalCal;
        else if (model === this.ITK) newModel = this.originalITK;
        else if (model === this.Muon) newModel = this.originalMuon;
        break;
    }
  
    newModel.position.copy(position);
    newModel.rotation.copy(rotation);
    newModel.scale.copy(scale);
  
    this.scene.add(newModel);
  
    if (model === this.MGNT) {
      this.MGNT = newModel;
      this.MGNTisSelected = true;
    }
    if (model === this.Cal) {
      this.Cal = newModel;
      this.CalisSelected = true;
    }
    if (model === this.ITK) {
      this.ITK = newModel;
      this.ITKisSelected = true;
    }
    if (model === this.Muon) {
      this.Muon = newModel;
      this.MuonisSelected = true;
    }
  };

  updateCutButtonStyles = () => {
    this.cut1.style.backgroundImage = "url('./shared/hex.png')";
    this.cut2.style.backgroundImage = "url('./shared/hex.png')";
    this.uncut.style.backgroundImage = "url('./shared/hex.png')";
  
    if (!this.hasObjects) return;
  
    switch (this.currentCutState) {
      case 'cut1':
        this.cut1.style.backgroundImage = "url('./shared/filledHex.png')";
        break;
      case 'cut2':
        this.cut2.style.backgroundImage = "url('./shared/filledHex.png')";
        break;
      default: 
        this.uncut.style.backgroundImage = "url('./shared/filledHex.png')";
        break;
    }

    this.updateDeleteButtonStyle();
  };

  updateDeleteButtonStyle = () => {
    if (this.hasObjects) {
      this.button.style.backgroundImage = "url('./shared/filledHex.png')";
    } else {
      this.button.style.backgroundImage = "url('./shared/hex.png')";
    }
  };

  activateXR = async () => {
    try {
      this.xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      });

      this.createXRCanvas();

      await this.onSessionStarted();
    } catch (e) {
      console.log(e);
      onNoXRDevice();
    }
  }

  createXRCanvas() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl", {xrCompatible: true});

    this.xrSession.updateRenderState({
      baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
    });
  }

  onSessionStarted = async () => {
    document.body.classList.add('ar');

    this.setupThreeJs();

    this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');

    this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');

    this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });

    this.xrSession.requestAnimationFrame(this.onXRFrame);

    this.xrSession.addEventListener("select", this.onSelect);
  };

  onSelect = () => {    
    const interactionPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    interactionPlane.position.copy(this.reticle.position);
    this.scene.add(interactionPlane);
  
    const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
    if (shadowMesh) {
      shadowMesh.position.y = this.reticle.position.y;
    }
  };

  onXRFrame = (time, frame) => {
    this.xrSession.requestAnimationFrame(this.onXRFrame);
  
    const framebuffer = this.xrSession.renderState.baseLayer.framebuffer;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.renderer.setFramebuffer(framebuffer);
  
    const pose = frame.getViewerPose(this.localReferenceSpace);
    if (pose) {
      const view = pose.views[0];
  
      const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
      this.renderer.setSize(viewport.width, viewport.height);
  
      this.camera.matrix.fromArray(view.transform.matrix);
      this.camera.projectionMatrix.fromArray(view.projectionMatrix);
      this.camera.updateMatrixWorld(true);
  
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
  
      if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);
  
        if (!this.stabilized && hitTestResults.length > 0) {
          this.stabilized = true;
          document.body.classList.add('stabilized');
        }
  
        this.reticle.visible = !this.hasObjects;
  
        if (!this.hasObjects) {
          this.reticle.position.set(
            hitPose.transform.position.x,
            hitPose.transform.position.y,
            hitPose.transform.position.z
          );
          this.reticle.updateMatrixWorld(true);
        }
      }
  
      this.renderer.render(this.scene, this.camera);
    }
  };
};

window.app = new App();
