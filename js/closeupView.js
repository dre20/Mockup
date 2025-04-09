import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getSceneObjects } from './sceneSetup.js';

// Closeup view variables
let closeupScene, closeupCamera, closeupRenderer, closeupControls;
let selectedCube = null;

// Setup close-up view
export function setupCloseupView() {
  const container = document.getElementById('closeup-container');
  
  closeupScene = new THREE.Scene();
  closeupCamera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  closeupCamera.position.z = 5;
  
  closeupRenderer = new THREE.WebGLRenderer({ antialias: true });
  closeupRenderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(closeupRenderer.domElement);
  
  closeupControls = new OrbitControls(closeupCamera, closeupRenderer.domElement);
  closeupControls.enableDamping = true;
  closeupControls.dampingFactor = 0.25;
  
  // Lighting for close-up view
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  closeupScene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  closeupScene.add(directionalLight);
  
  // Handle window resize for close-up view
  window.addEventListener('resize', () => {
    if (closeupRenderer) {
      const container = document.getElementById('closeup-container');
      closeupCamera.aspect = container.clientWidth / container.clientHeight;
      closeupCamera.updateProjectionMatrix();
      closeupRenderer.setSize(container.clientWidth, container.clientHeight);
    }
  });
}

// Show close-up view of a cube
export function showCloseupView(cubeMesh) {
  // Hide the original cube
  cubeMesh.visible = false;
  
  // Create a clone of the cube for close-up view
  selectedCube = cubeMesh.clone();
  
  // Ensure the clone has the same material properties
  if (cubeMesh.material) {
    selectedCube.material = cubeMesh.material.clone();
  }
  
  // Clear previous closeup scene
  const container = document.getElementById('closeup-container');
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  // Setup closeup view if not already done
  if (!closeupRenderer) {
    setupCloseupView();
  }
  
  // Add the cube to the closeup scene
  closeupScene.add(selectedCube);
  
  // Center the cube in the closeup view
  const box = new THREE.Box3().setFromObject(selectedCube);
  const center = box.getCenter(new THREE.Vector3());
  selectedCube.position.sub(center);
  
  // Adjust camera distance based on cube size
  const size = box.getSize(new THREE.Vector3()).length();
  closeupCamera.position.z = size * 2;
  closeupControls.target.set(0, 0, 0);
  closeupControls.update();
  
  // Show cube description
  const cubeDescription = document.getElementById('cube-description');
  cubeDescription.style.display = 'block';
  
  // Set different description based on which cube was clicked
  if (cubeMesh.name.includes('Water')) {
    cubeDescription.textContent = "Water Cube: Staying hydrated is essential for all bodily functions.";
  } else if (cubeMesh.name.includes('Exercise')) {
    cubeDescription.textContent = "Exercise Cube: Regular physical activity strengthens your body and mind.";
  } else if (cubeMesh.name.includes('Vegetables')) {
    cubeDescription.textContent = "Vegetable Cube: A diet rich in vegetables provides essential nutrients.";
  } else if (cubeMesh.name.includes('Sleep')) {
    cubeDescription.textContent = "Sleep Cube: Quality sleep is crucial for recovery and mental health.";
  } else {
    cubeDescription.textContent = "This cube represents an important aspect of your lifestyle.";
  }
  
  // Show the overlay
  document.getElementById('closeup-overlay').style.display = 'flex';
}

// Hide close-up view
export function hideCloseupView() {
  document.getElementById('closeup-overlay').style.display = 'none';
  document.getElementById('cube-description').style.display = 'none';
  
  if (selectedCube) {
    closeupScene.remove(selectedCube);
    
    // Find and show the original cube again
    const { model } = getSceneObjects();
    model.traverse((child) => {
      if (child.userData.isCube && child.name === selectedCube.name) {
        child.visible = true;
      }
    });
    
    selectedCube = null;
  }
}

// Render closeup view function to be called in animation loop
export function renderCloseupView() {
  if (closeupRenderer && document.getElementById('closeup-overlay').style.display === 'flex') {
    closeupControls.update();
    closeupRenderer.render(closeupScene, closeupCamera);
  }
}

// Get closeup objects for external use
export function getCloseupObjects() {
  return {
    closeupScene,
    closeupCamera,
    closeupRenderer,
    closeupControls,
    selectedCube
  };
}