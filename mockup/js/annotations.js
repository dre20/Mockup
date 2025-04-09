// Variables to hold annotation elements
let annotationIcon = null;
let annotationPopup = null;

// Create annotation elements
export function createAnnotationElements() {
  annotationIcon = document.createElement('div');
  annotationIcon.className = 'annotation-icon';
  annotationIcon.textContent = '!';
  annotationIcon.style.display = 'none';
  document.body.appendChild(annotationIcon);
  
  annotationPopup = document.createElement('div');
  annotationPopup.className = 'annotation-popup';
  annotationPopup.innerHTML = `
    <strong>Suzanne the Monkey:</strong> This is a 3D model of a monkey head, often used as a test model in 3D graphics. 
    Monkeys are primates known for their intelligence and social behavior.
  `;
  document.body.appendChild(annotationPopup);
  
  // Toggle popup when icon is clicked
  annotationIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    annotationPopup.classList.toggle('visible');
  });
  
  // Close popup when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!annotationPopup.contains(e.target) && e.target !== annotationIcon) {
      annotationPopup.classList.remove('visible');
    }
  });
}

// Position annotation elements based on Suzanne's position
export function updateAnnotationPosition(suzanneMesh, camera) {
  if (!suzanneMesh || !annotationIcon) return;
  
  // Get Suzanne's position in screen space
  const position = suzanneMesh.getWorldPosition(new THREE.Vector3());
  position.project(camera);
  
  // Convert to CSS coordinates
  const x = (position.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(position.y * 0.5) + 0.5) * window.innerHeight;
  
  // Position the icon
  annotationIcon.style.left = `${x - 12}px`;
  annotationIcon.style.top = `${y - 12}px`;
  
  // Position the popup to the right of the icon
  annotationPopup.style.left = `${x + 20}px`;
  annotationPopup.style.top = `${y - 20}px`;
}

// Show annotation icon
export function showAnnotationIcon() {
  if (annotationIcon) {
    annotationIcon.style.display = 'block';
  }
}

// Hide annotation icon
export function hideAnnotationIcon() {
  if (annotationIcon) {
    annotationIcon.style.display = 'none';
  }
}

// Get annotation elements
export function getAnnotationElements() {
  return {
    annotationIcon,
    annotationPopup
  };
}