// Import necessary components from Three.js and additional modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Select the DOM container where the scene will be rendered
const container = document.getElementById('scene-container');

// Create a new Three.js scene
const scene = new THREE.Scene();

// Set up the camera with a perspective view
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
// Position the camera for a top-down view
camera.position.x = 0;
camera.position.y = 500; // Adjust height for top-down view
camera.position.z = 0;

// Create the WebGL renderer and attach it to the container
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Set up orbit controls for interactive scene rotation
const controls = new OrbitControls(camera, renderer.domElement);
// Restrict the vertical rotation to prevent viewing the model from below
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
// Enable damping (inertia) for smoother control
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Update the camera position based on the model's bounding box
function updateCameraPosition(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    camera.lookAt(center);
    controls.target.copy(center);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2));
    cameraZ += 100; // Adjust distance to fit the model
    camera.position.set(camera.position.x, camera.position.y, cameraZ);
    controls.target.copy(center);
    controls.update();
}

const models = []; // Array to store loaded models
const modelPaths = ['/public/waste_model_8.glb', '/public/waste_model_11.glb', '/public/waste_model_8.glb', '/public/waste_model_11.glb'];

console.log("All models loaded:", models);

// Loader for importing GLTF models
const loader = new GLTFLoader();
// Load the model and add it to the scene
function loadModel(path, index) {
    loader.load(path, function ( gltf ) {
        const model = gltf.scene;
        model.visible = (index === 0); // Only the first model is visible initially
        model.position.set(0, 4.125, 0);
        model.scale.set(1, 1, 1);
        console.log("Model scale after setting:", model.scale);
        scene.add(model);
        models[index] = model;

        console.log("Model loaded:", path);

        // Update camera position to frame the model
        if (index === 0) {
            updateCameraPosition(model); // Initial camera setup for the first model
        }
    }, undefined, function ( error ) {
        console.error( error );
    });
}

const slider = document.getElementById('modelSlider');
slider.addEventListener('input', function() {
    const modelIndex = parseInt(this.value, 10) - 1; // Convert slider value to model index (0-based)
    models.forEach((model, index) => {
        model.visible = (index === modelIndex); // Show the selected model and hide others
    });
    updateCameraPosition(models[modelIndex]); // Update camera to focus on the new model
});


// Event listener for window resize to adjust camera and renderer
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    controls.update();
}

// Animation loop for rendering the scene
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls for damping
    renderer.render(scene, camera);
}

// Check for WebGL compatibility and start the animation loop
import WebGL from 'three/addons/capabilities/WebGL.js';
if ( WebGL.isWebGLAvailable() ) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('scene-container').appendChild(warning);
}

// Start loading the model
modelPaths.forEach((path, index) => {
  loadModel(path, index);
});
