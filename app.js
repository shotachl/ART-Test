(async function() {
  const isArSessionSupported = navigator.xr && navigator.xr.isSessionSupported && await navigator.xr.isSessionSupported("immersive-ar");
  document.querySelector(".hex.pos0").style.display = "none";
  document.querySelector(".hex.reset").style.display = "none";
  if (isArSessionSupported) {
    document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)
  } else {
    onNoXRDevice();
  }
})();

let clicks = 0;

/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class App {
  constructor() {
    // this.spawnedObjects = [];
    this.initialObjectSpawned = false;
    this.selectedModel = null;
    this.logOutput = document.getElementById('logOutput');
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      const message = args.join(' ');
      const logElement = document.createElement('div');
      logElement.textContent = message;
      this.logOutput.appendChild(logElement);
      this.logOutput.scrollTop = this.logOutput.scrollHeight;
    };
  }

  setupThreeJs() {
    // To help with working with 3D on the web, we'll use three.js.
    // Set up the WebGLRenderer, which handles rendering to our session's base layer.

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: this.gl
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize our demo scene.
    this.scene = DemoUtils.createLitScene();
    this.reticle = new Reticle();
    this.scene.add(this.reticle);
    this.touchX;
    this.lastTouchX;
    this.buttonClicked = false;
    this.hexClicked = false;
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
    this.MSisSelected = false;
    this.ITKisSelected = false;
    this.MuonisSelected = false;


    // We'll update the camera matrices directly from API, so
    // disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    this.camera = new THREE.PerspectiveCamera();
    this.camera.matrixAutoUpdate = false;

    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
    this.button.addEventListener('click', this.onButtonClick);  
    this.hex0.addEventListener('click', this.onHexClick);
    this.hex1.addEventListener('click', () => this.selectModel('gate'));
    this.hex2.addEventListener('click', () => this.selectModel('cal'));
    this.hex3.addEventListener('click', () => this.selectModel('itk'));
    this.hex4.addEventListener('click', () => this.selectModel('muon'));
    // this.cut1.addEventListener('click', () => this.cycleCutState('cut1'));
    // this.cut2.addEventListener('click', () => this.cycleCutState('cut2'));
    // this.uncut.addEventListener('click', () => this.cycleCutState('uncut'));

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

    this.hex0.style.display = "inline-block";
    this.button.style.display = "inline-block";

  }

  onTouchStart = (event) => {
    if (event.touches.length === 2) {
        this.touchStartDistance = null;
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
    }
};

 onTouchMove = (event) => {
    if (!this.lastClone) return;
    const touch = event.changedTouches[0];

    const currentTouchX = touch.clientX;
    const currentTouchY = touch.clientY;

    const deltaX = currentTouchX - (this.touchX || currentTouchX);
    const deltaY = currentTouchY - (this.touchY || currentTouchY);

    this.lastClone.rotation.y += deltaX * 0.01;
    this.lastClone.rotation.x += deltaY * 0.01;

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

      this.lastClone.scale.set(
        this.lastClone.scale.x * scaleFactor, 
        this.lastClone.scale.y * scaleFactor, 
        this.lastClone.scale.z * scaleFactor
      );

      this.touchStartDistance = touchDistance;
    }

    this.touchX = currentTouchX;
    this.touchY = currentTouchY;
  }

  onTouchEnd = (event) => {
    if (event.touches.length < 2) {
      this.touchStartDistance = null;
    }
    this.touchX = null;
    this.touchY = null;
  }

  onButtonClick = (event) => {
    this.buttonClicked = true;
    event.stopPropagation();
    
    // this.spawnedObjects.forEach(object => this.scene.remove(object));
    // this.spawnedObjects = [];

    if (this.lastClone) {
      this.scene.remove(this.lastClone);
      this.lastClone = null;

      this.hex1.style.backgroundImage = "url('./shared/hex.png')";
      this.hex2.style.backgroundImage = "url('./shared/hex.png')";
      this.hex3.style.backgroundImage = "url('./shared/hex.png')";
      this.hex4.style.backgroundImage = "url('./shared/hex.png')";
    }

    clicks = 0;
  }

  onHexClick = (event) => {
    event.stopPropagation();
    this.hexClicked = true;
    this.otherHexes.forEach(hex => hex.classList.toggle('hidden'));

    this.hex0.classList.toggle('filled');
  };

  selectModel(modelName) {
    this.hexClicked = true;
    
    switch (modelName) {
      case 'gate':
        this.selectedModel = window.gateModel;
        break;
      case 'cal':
        this.selectedModel = window.calModel;
        break;
      case 'itk':
        this.selectedModel = window.ITKModel;
        break;
      case 'muon':
        this.selectedModel = window.muonModel;
        break;
      default:
        console.error('Invalid model name:', modelName);
        return;
    }
  }

  cycleCutState = (state) => {
    if (!this.lastClone) {
      return;
    }

    this.cut1.style.backgroundImage = "url('./shared/hex.png')";
    this.cut2.style.backgroundImage = "url('./shared/hex.png')";
    this.uncut.style.backgroundImage = "url('./shared/hex.png')";
    if (this.lastClone) {
      const originalScale = this.lastClone.scale.clone();
      const originalRotation = this.lastClone.rotation.clone();
      const originalPosition = this.lastClone.position.clone();
  
      this.scene.remove(this.lastClone);
      this.lastClone = null;
  
      let selectedGroup = null;
  
      if (state === 'cut1') {
        this.cut1.style.backgroundImage = "url('./shared/filledHex.png')";
        selectedGroup = this.CalisSelected 
          ? CCut1Group 
          : (this.ITKisSelected 
            ? ITKCut1Group 
            : (this.MuonisSelected ? muonCut1Group : MSCut1Group));
      } else if (state === 'cut2') {
        this.cut2.style.backgroundImage = "url('./shared/filledHex.png')";
        selectedGroup = this.CalisSelected 
          ? CCut2Group 
          : (this.ITKisSelected 
            ? ITKCut2Group 
            : (this.MuonisSelected ? muonCut2Group : MSCut2Group));
      } else if (state === 'uncut') {
        this.uncut.style.backgroundImage = "url('./shared/filledHex.png')";
        selectedGroup = this.CalisSelected 
          ? CGroup 
          : (this.ITKisSelected 
            ? ITKGroup 
            : (this.MuonisSelected ? muonGroup : MSGroup));
      }   
  
      if (selectedGroup) {
        const newClone = selectedGroup.clone();
  
        newClone.position.copy(originalPosition);
        newClone.rotation.copy(originalRotation);
        newClone.scale.copy(originalScale);
  
        this.scene.add(newClone);
  
        this.lastClone = newClone;
  
      } else {
        console.error(`No valid group found for state: ${state}`);
      }
    } else {
      console.warn('No object to cut. Ensure an object is selected and placed.');
    }
  };
  

  /**
   * Run when the Start AR button is pressed.
   */
  activateXR = async () => {
    try {
      // Initialize a WebXR session using "immersive-ar".
      this.xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      });

      // Create the canvas that will contain our camera's background and our virtual scene.
      this.createXRCanvas();

      // With everything set up, start the app.
      await this.onSessionStarted();
    } catch (e) {
      console.log(e);
      onNoXRDevice();
    }
  }

  /**
   * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
   */
  createXRCanvas() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl", {xrCompatible: true});

    this.xrSession.updateRenderState({
      baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
    });
  }

  /**
   * Called when the XRSession has begun. Here we set up our three.js
   * renderer, scene, and camera and attach our XRWebGLLayer to the
   * XRSession and kick off the render loop.
   */
  onSessionStarted = async () => {
    // Add the `ar` class to our body, which will hide our 2D components
    document.body.classList.add('ar');

    // To help with working with 3D on the web, we'll use three.js.
    this.setupThreeJs();

    this.selectedModel = window.gateModel;

    // Setup an XRReferenceSpace using the "local" coordinate system.
    this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');

    // Create another XRReferenceSpace that has the viewer as the origin.
    this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.
    this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });

    // Start a rendering loop using this.onXRFrame.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    this.xrSession.addEventListener("select", this.onSelect);
  }

  /** Place an object when the screen is tapped. */
  onSelect = () => {
    if (this.buttonClicked || this.hexClicked) {
      this.buttonClicked = false;
      this.hexClicked = false;
      return;
    }

    if (this.selectedModel && this.reticle.visible === true) {
      const clone = this.selectedModel.clone();
      clone.position.copy(this.reticle.position);

      this.distance = this.camera.position.distanceTo(this.reticle.position);
      this.scaleG = 0.01 * this.distance;
      this.scaleC = 0.02 * this.distance;
      this.scaleITK = 0.02 * this.distance;
      this.scaleM = 0.01 * this.distance;

      if (this.selectedModel === window.gateModel) {
        clone.scale.set(this.scaleG, this.scaleG, this.scaleG);
        this.hex1.style.backgroundImage = "url('./shared/filledHex.png')";
        this.MSisSelected = true;
        this.CalisSelected = false;
        this.ITKisSelected = false;
        this.MuonisSelected = false;
      } else if (this.selectedModel === window.calModel) {
        clone.scale.set(this.scaleC, this.scaleC, this.scaleC);
        this.hex2.style.backgroundImage = "url('./shared/filledHex.png')";
        this.CalisSelected = true;
        this.MSisSelected = false;
        this.ITKisSelected = false;
        this.MuonisSelected = false;
      } else if (this.selectedModel === window.muonModel) {
        clone.scale.set(this.scaleM, this.scaleM, this.scaleM);
        this.hex4.style.backgroundImage = "url('./shared/filledHex.png')";
        this.MuonisSelected = true;
        this.ITKisSelected = false;
        this.MSisSelected = false;
        this.CalisSelected = false;
      } else if (this.selectedModel === window.ITKModel) {
        clone.scale.set(this.scaleITK, this.scaleITK, this.scaleITK);
        this.hex3.style.backgroundImage = "url('./shared/filledHex.png')";
        this.ITKisSelected = true;
        this.MSisSelected = false;
        this.CalisSelected = false;
        this.MuonisSelected = false;
      } 

      this.scene.add(clone);
      // this.spawnedObjects.push(clone);

      this.lastClone = clone;

      this.initialObjectSpawned = true;

      this.uncut.style.backgroundImage = "url('./shared/filledHex.png')";
        
      const interactionPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      interactionPlane.position.copy(clone.position);
      this.scene.add(interactionPlane);

      const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
      shadowMesh.position.y = clone.position.y;
      
      clicks++;
    }
  }

  /**
   * Called on the XRSession's requestAnimationFrame.
   * Called with the time and XRPresentationFrame.
   */
  ///comment this is where u should ctrl+z to
  onXRFrame = (time, frame) => {
    // Queue up the next draw request.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    // Bind the graphics framebuffer to the baseLayer's framebuffer.
    const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.renderer.setFramebuffer(framebuffer);

    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(this.localReferenceSpace);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];

      const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
      this.renderer.setSize(viewport.width, viewport.height)

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      this.camera.matrix.fromArray(view.transform.matrix)
      this.camera.projectionMatrix.fromArray(view.projectionMatrix);
      this.camera.updateMatrixWorld(true);

      // Conduct hit test.
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);

      // If we have results, consider the environment stabilized.
      if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);

        if (!this.stabilized && hitTestResults.length > 0) {
          this.stabilized = true;
          document.body.classList.add('stabilized');
        }

        // Update the reticle position
        if(clicks < 1){
          this.reticle.visible = true;
          this.cut1.style.backgroundImage = "url('./shared/hex.png')";
          this.cut2.style.backgroundImage = "url('./shared/hex.png')";
          this.uncut.style.backgroundImage = "url('./shared/hex.png')";
          this.button.style.backgroundImage = "url('./shared/hex.png')";
        }else if(clicks >= 1){
          this.reticle.visible = false;
          this.button.style.backgroundImage = "url('./shared/filledHex.png')";
        }

        if (clicks === 0) {
          this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
          this.reticle.updateMatrixWorld(true);
        }
        
      }

      // Render the scene with THREE.WebGLRenderer.
      this.renderer.render(this.scene, this.camera);
    } 
  }
};

window.app = new App();