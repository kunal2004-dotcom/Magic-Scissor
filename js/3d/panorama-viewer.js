import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class PanoramaViewer {
  constructor(containerId, imagePath) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 0.01); // Just slightly off-center to allow looking around

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imagePath,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Create a sphere
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        // Invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale(-1, 1, 1);

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        
        // Remove loading spinner if present
        const loader = this.container.querySelector('.pano-loader');
        if(loader) loader.remove();
      },
      undefined,
      (err) => {
        console.error('An error happened loading the panorama texture', err);
      }
    );

    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.animate();
  }

  onWindowResize() {
    if(!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
