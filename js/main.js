import { setupScene, loadModel, startAnimationLoop, startGameTimer } from './sceneSetup.js';
import { setupCloseupView, renderCloseupView } from './closeupView.js';
import { setupAllQuestions, showGameOver } from './gameLogic.js';
import { setupUIHandlers, setupCubeSelection } from './uiHandlers.js';
import { createAnnotationElements, updateAnnotationPosition, showAnnotationIcon } from './annotations.js';
import * as THREE from 'three';

// Initialize the application
function init() {
  // Setup the 3D scene
  const { scene, camera, renderer, controls } = setupScene();
  
  // Setup UI event handlers
  setupUIHandlers();
  
  // Setup closeup view
  setupCloseupView();
  
  // Setup game questions
  setupAllQuestions();
  
  // Load the 3D model
  loadModel((modelData) => {
    const { model, suzanneMesh } = modelData;
    
    // Create annotation elements for Suzanne
    if (suzanneMesh) {
      createAnnotationElements();
      showAnnotationIcon();
      updateAnnotationPosition(suzanneMesh, camera);
      
      // Update annotation position when camera moves
      controls.addEventListener('change', () => {
        updateAnnotationPosition(suzanneMesh, camera);
      });
    }
    
    // Setup cube selection with raycasting
    setupCubeSelection();
  });
  
  // Start the animation loop with custom updates
  startAnimationLoop((delta) => {
    // Render closeup view if it's visible
    renderCloseupView();
  });
  
  // Start the game timer
  startGameTimer(showGameOver);
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);