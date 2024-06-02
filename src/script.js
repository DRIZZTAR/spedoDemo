import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import waterVertexShader from './shaders/water/vertex.glsl';
import waterFragmentShader from './shaders/water/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
gui.close();
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(2, 2, -1);
directionalLight.castShadow = true;
scene.add(directionalLight);

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 3, 1024, 1024);
waterGeometry.deleteAttribute('normal');
waterGeometry.deleteAttribute('uv');

// Colors
debugObject.depthColor = '#000000';
debugObject.surfaceColor = '#404068';

gui.addColor(debugObject, 'depthColor').onChange(() => {
	waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
});
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
	waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});

// Material
const waterMaterial = new THREE.ShaderMaterial({
	vertexShader: waterVertexShader,
	fragmentShader: waterFragmentShader,
	uniforms: {
		uTime: { value: 0 },
		uShift: { value: 0.01 },

		uBigWavesElevation: { value: 0.05 },
		uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
		uBigWavesSpeed: { value: 0.75 },

		uSmallWavesElevation: { value: 0.15 },
		uSmallWavesFrequency: { value: 2 },
		uSmallWavesSpeed: { value: 0.2 },
		uSmallIterations: { value: 1 },

		uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
		uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
		uColorOffset: { value: 0.925 },
		uColorMultiplier: { value: 1 },
	},
});

gui.add(waterMaterial.uniforms.uShift, 'value').min(-1).max(1).step(0.001).name('uShift');

gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX');
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY');
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed');

gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation');
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency');
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed');
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations');

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Text
 */
// Colors for text
debugObject.textDepthColor = '#9cd4ea';
debugObject.textSurfaceColor = '#ff0000';

gui.addColor(debugObject, 'textDepthColor').onChange(() => {
	textMaterial.uniforms.uDepthColor.value.set(debugObject.textDepthColor);
});
gui.addColor(debugObject, 'textSurfaceColor').onChange(() => {
	textMaterial.uniforms.uSurfaceColor.value.set(debugObject.textSurfaceColor);
});

// Material for text
const textMaterial = new THREE.ShaderMaterial({
	vertexShader: waterVertexShader,
	fragmentShader: waterFragmentShader,
	uniforms: {
		uTime: { value: 0 },
		uShift: { value: 0.01 },

		uBigWavesElevation: { value: 0.2 },
		uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
		uBigWavesSpeed: { value: 0.75 },

		uSmallWavesElevation: { value: 0.15 },
		uSmallWavesFrequency: { value: 3 },
		uSmallWavesSpeed: { value: 0.2 },
		uSmallIterations: { value: 1 },

		uDepthColor: { value: new THREE.Color(debugObject.textDepthColor) },
		uSurfaceColor: { value: new THREE.Color(debugObject.textSurfaceColor) },
		uColorOffset: { value: 0.925 },
		uColorMultiplier: { value: 1 },
	},
});

const fontLoader = new FontLoader();

fontLoader.load('/fonts/italic.json', (font) => {
	const text = 'speedo';
	const letterSpacing = 0.01;
	let xOffset = -0.6;

	text.split('').forEach((char) => {
		const textGeometry = new TextGeometry(char, {
			font: font,
			size: 0.25,
			depth: 0.05,
			curveSegments: 48,
			bevelEnabled: true,
			bevelThickness: 0.03,
			bevelSize: 0.02,
			bevelOffset: 0,
			bevelSegments: 30,
		});

		textGeometry.computeBoundingBox();
		const boundingBox = textGeometry.boundingBox;
		const charWidth = boundingBox.max.x - boundingBox.min.x;

		const mesh = new THREE.Mesh(textGeometry, textMaterial);
		mesh.position.set(xOffset, 0.4, 0);
		mesh.rotation.x = -Math.PI * 0.5;
		scene.add(mesh);

		xOffset += charWidth + letterSpacing;
	});
});

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 1);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha:true,
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Water
	waterMaterial.uniforms.uTime.value = elapsedTime;
	textMaterial.uniforms.uTime.value = elapsedTime;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
