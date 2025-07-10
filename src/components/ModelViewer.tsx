import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface ModelViewerProps {
  path: string;
}

export default function ModelViewer({ path }: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    console.log("🚀 ~ ModelViewer.tsx:17 ~ useEffect ~ currentMount:", currentMount)

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    // ✨ ADDITION: Add a fog for depth
    scene.fog = new THREE.Fog(0xdddddd, 10, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      30,
      currentMount.clientWidth / currentMount.clientHeight,
      0.02,
      1000
    );
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    // ✨ MODIFICATION: Enable shadow mapping
    renderer.setPixelRatio(window.devicePixelRatio); // For sharper images on high-DPI screens
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // ✨ MODIFICATION: Camera controls settings
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    // controls.minDistance = 1;
    // controls.maxDistance = 50;

    // Light
    // ✨ MODIFICATION: Adjust lighting for better contrast and highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // Stronger key light
    directionalLight.position.set(8, 10, 5);
    // ✨ ADDITION: Enable shadow casting for this light
    directionalLight.castShadow = true;
    // ✨ ADDITION: Configure shadow properties for better quality
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);
    
    // ✨ ADDITION: Add a subtle fill light from below
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2);
    scene.add(hemisphereLight);

    // ✨ ADDITION: Add a ground plane to receive shadows
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 }); // Special material to only receive shadows
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0; // Set its position
    plane.receiveShadow = true;
    scene.add(plane);

    // Loader
    const loader = new STLLoader();
    loader.load(path, (geometry) => {
      console.log("🚀 ~ ModelViewer.tsx:85 ~ loader.load ~ geometry:", geometry)
      console.log("🚀 ~ ModelViewer.tsx:86 ~ loader.load ~ geometry.morphAttributes:", geometry.morphAttributes)
      // Compute vertex normals for better shading
      geometry.computeVertexNormals();

      // Create multiple materials for different parts (if groups exist) or use a single material with color variation
      // ✨ MODIFICATION: Use MeshStandardMaterial for realistic PBR rendering
      const material = new THREE.MeshStandardMaterial({
        color: 0x909090, // A neutral grey color
        metalness: 0.6,   // Makes it look more like metal
        roughness: 0.4,   // Controls the blurriness of reflections
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // ✨ ADDITION: Enable the mesh to cast shadows
      mesh.castShadow = true;
      scene.add(mesh);

      // --- START: Camera and Controls Correction ---

      // 1. Calculate bounding box and center the mesh at the origin
      const boundingBox = new THREE.Box3().setFromObject(mesh);
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
      
      mesh.position.sub(center); // This moves the object's center to (0,0,0)

      // 2. Position the ground plane at the bottom of the now-centered object
      // ✨ FIX: Calculate the plane's Y position based on the object's new centered position.
      const newBottomY = -size.y / 2;
      plane.position.y = newBottomY;

      // 3. Calculate the ideal camera distance to frame the object
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      // 4. Set the camera's position
      // ✨ FIX: Position the camera relative to the origin (0,0,0), not the old 'center' coordinates.
      // We multiply by 1.5 to give the object a bit of space in the viewport.
      const cameraPosition = cameraDistance * 1.5;
      camera.position.set(cameraPosition, cameraPosition, cameraPosition);

      // 5. Point the camera's orbit controls at the new center
      // ✨ FIX: The target is the origin, because that's where the object's center is now.
      controls.target.set(0, 0, 0);

      // 6. (Recommended) Set dynamic zoom limits
      controls.minDistance = cameraDistance / 2;
      controls.maxDistance = cameraDistance * 3;

      controls.update();
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, [path]);

  return <div ref={mountRef} className="w-full h-96" />;
}
