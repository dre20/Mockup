import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene variables that will be exported
let scene, camera, renderer, controls, model, mixer;
let suzanneMesh = null;
let suzanneAction = null;
let armatureAction = null;
let isPaused = false;
let gameOverTimeout;

// Export scene setup function
export function setupScene() {
  // Create scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting setup
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-3, 10, -10);
  scene.add(dirLight);

  // Set up orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Handle window resizing
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  return { scene, camera, renderer, controls };
}

// Load the 3D model
export function loadModel(onModelLoaded) {
  const loader = new GLTFLoader();
  
  loader.load(
    'myScene.glb',
    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      // Center the model and adjust camera positioning
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      model.position.sub(center);
      controls.target.set(0, 0, 0);
      controls.update();

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(0, 0, 0);

      // Handle any animations in the GLB model
      mixer = new THREE.AnimationMixer(model);
      
      // Find Suzanne and armature animations
      let hasSuzanne = false;
      let hasArmature = false;
      
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
        
        // Check if this is the Suzanne animation
        if (clip.name.toLowerCase().includes('suzanne')) {
          suzanneAction = action;
          hasSuzanne = true;
        }
        
        // Check if this is the armature animation
        if (clip.name.toLowerCase().includes('armature')) {
          armatureAction = action;
          hasArmature = true;
        }
      });
      
      // If we found both animations, ensure they're not paused initially
      if (hasSuzanne && hasArmature) {
        suzanneAction.paused = false;
        armatureAction.paused = false;
      }

      // Find all cubes in the model and make them clickable
      model.traverse((child) => {
        if (child.isMesh && child.name.toLowerCase().includes('cube')) {
          child.userData.isCube = true;
          child.cursor = 'pointer';
        }
        
        // Find Suzanne mesh for annotation
        if (child.isMesh && child.name.toLowerCase().includes('suzanne')) {
          suzanneMesh = child;
        }
      });

      // Call the callback with the loaded model data
      if (onModelLoaded) {
        onModelLoaded({
          model,
          mixer,
          suzanneMesh,
          suzanneAction,
          armatureAction
        });
      }
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );
}

// Animation loop function
export function startAnimationLoop(customUpdateFunction) {
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isPaused) {
      if (mixer) mixer.update(delta);
      controls.update();
    }
    
    // Call custom update function if provided
    if (customUpdateFunction) {
      customUpdateFunction(delta);
    }
    
    renderer.render(scene, camera);
  }
  
  animate();
}

// Set pause state
export function setPaused(paused) {
  isPaused = paused;
  if (mixer) {
    mixer.timeScale = paused ? 0 : 1;
  }
}

// Get various scene objects and states
export function getSceneObjects() {
  return {
    scene,
    camera,
    renderer,
    controls,
    model,
    mixer,
    suzanneMesh,
    suzanneAction,
    armatureAction,
    isPaused
  };
}

// Handle game timer
export function startGameTimer(onGameOver, timeLimit = 60000) {
  // Clear any existing timeout
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
  }
  
  // Set up a new timeout
  gameOverTimeout = setTimeout(() => {
    if (!isPaused && onGameOver) {
      onGameOver();
    }
  }, timeLimit);
  
  return gameOverTimeout;
}

export function clearGameTimer() {
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
  }
}