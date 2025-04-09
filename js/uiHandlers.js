import { showCloseupView, hideCloseupView } from './closeupView.js';
import { togglePause, showGameOver } from './gameLogic.js';
import { getSceneObjects, setPaused, clearGameTimer, startGameTimer } from './sceneSetup.js';
import * as THREE from 'three';

// Variables to track UI state
let popoutVisible = false;

// Set up UI event handlers
export function setupUIHandlers() {
  // Handle hamburger click to toggle popout visibility
  const hamburger = document.getElementById('hamburger');
  const popout = document.getElementById('popout');
  const closeupExit = document.getElementById('closeup-exit');
  const pauseButton = document.getElementById('pause-button');
  
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    popoutVisible = !popoutVisible;
    
    if (popoutVisible) {
      popout.style.display = 'block';
      setTimeout(() => {
        popout.style.transform = 'translateX(-50%) translateY(0)';
        popout.style.opacity = '1';
        popout.style.pointerEvents = 'auto';
      }, 10);
    } else {
      popout.style.transform = 'translateX(-50%) translateY(-20px)';
      popout.style.opacity = '0';
      popout.style.pointerEvents = 'none';
      setTimeout(() => {
        popout.style.display = 'none';
      }, 300);
    }
  });

  // Close the popout when clicking anywhere outside of it
  window.addEventListener('click', (event) => {
    if (!popout.contains(event.target) && event.target !== hamburger && popoutVisible) {
      popoutVisible = false;
      popout.style.transform = 'translateX(-50%) translateY(-20px)';
      popout.style.opacity = '0';
      popout.style.pointerEvents = 'none';
      setTimeout(() => {
        popout.style.display = 'none';
      }, 300);
    }
  });
  
  // Close close-up view when clicking the exit button
  closeupExit.addEventListener('click', hideCloseupView);
  
  // Pause functionality
  pauseButton.addEventListener('click', () => {
    const isPaused = togglePause();
    
    if (isPaused) {
      // Clear the game over timeout
      clearGameTimer();
      pauseButton.textContent = '▶';
      
      // Pause animations
      setPaused(true);
    } else {
      // Restart the game timer
      startGameTimer(showGameOver);
      pauseButton.textContent = '⏸';
      
      // Resume animations
      setPaused(false);
    }
  });
}

// Setup raycasting for cube selection
export function setupCubeSelection() {
  const { model, camera } = getSceneObjects();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  function onMouseClick(event) {
    const { isPaused } = getSceneObjects();
    if (isPaused) return;
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersected objects
    const intersects = raycaster.intersectObject(model, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // Check if we clicked a cube by going up the parent chain
      let currentObj = clickedObject;
      while (currentObj !== null) {
        if (currentObj.userData.isCube) {
          showCloseupView(currentObj);
          break;
        }
        currentObj = currentObj.parent;
      }
    }
  }
  
  window.addEventListener('click', onMouseClick);
}