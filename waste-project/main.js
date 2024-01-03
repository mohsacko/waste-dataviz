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
controls.minPolarAngle = 0; // No rotation above the top
controls.maxPolarAngle = Math.PI / 2; // No rotation below the horizontal
controls.enableDamping = true; // For smoother control
controls.dampingFactor = 0.05;

// Function to update the camera position based on the model
function updateCameraPosition(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    camera.lookAt(center);
    controls.target.copy(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2));
    cameraZ += 100; // Adjust distance
    camera.position.set(camera.position.x, camera.position.y, cameraZ);
    controls.target.copy(center);
    controls.update();
}

// Array to store loaded models
const models = []; 
// Paths to model files
const modelPaths = ['/public/waste_model_8.glb', '/public/waste_model_11.glb', '/public/waste_model_8.glb', '/public/waste_model_11.glb'];

// Loader for importing GLTF models
const loader = new GLTFLoader();
function loadModel(path, index) {
    loader.load(path, function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 4.125, 0);
        model.scale.set(1, 1, 1);
        model.visible = (index === 0); // Only the first model is visible initially
        scene.add(model);
        models[index] = model;

        if (index === 0) {
            updateCameraPosition(model); // Camera setup for the first model
        }
    }, undefined, function (error) {
        console.error("Error loading model:", error);
    });
}

// Data for each model
const modelData = [
    { date: "Jan 1", volume: 20 },
    { date: "Jan 2", volume: 30 },
    { date: "Jan 3", volume: 25 },
    { date: "Jan 4", volume: 22 }
];

// Initialize the chart
const ctx = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: modelData.map(data => data.date),
        datasets: [{
            label: 'Waste Volume',
            data: modelData.map(data => data.volume),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            responsive: true, // Ensure the chart is responsive
            maintainAspectRatio: false, // Adjust aspect ratio if needed
            y: {
                beginAtZero: true
            }
        }
    }
});

// Slider event listener
const slider = document.getElementById('modelSlider');
slider.addEventListener('input', function() {
    const modelIndex = parseInt(this.value, 10) - 1;
    models.forEach((model, index) => {
        model.visible = (index === modelIndex);
    });
    updateCameraPosition(models[modelIndex]);

    // Highlight the selected model's data point
    myChart.data.datasets[0].pointBackgroundColor = modelData.map((_, index) => 
        index === modelIndex ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 99, 132, 1)'
    );
    myChart.update();
});

// Window resize event listener
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    controls.update();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// WebGL compatibility check
import WebGL from 'three/addons/capabilities/WebGL.js';
if ( WebGL.isWebGLAvailable() ) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('scene-container').appendChild(warning);
}

// Load models
modelPaths.forEach((path, index) => {
  loadModel(path, index);
});
