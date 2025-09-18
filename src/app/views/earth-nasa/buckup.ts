import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as leaflet from 'leaflet';

// Interfaz para los uniforms del shader de atmósfera
interface AtmosphereUniforms {
  [uniform: string]: THREE.IUniform<any>;
  time: { value: number };
}

@Component({
  selector: 'app-earth-nasa',
  imports: [DecimalPipe, CommonModule],
  standalone: true,
  templateUrl: './earth-nasa.component.html',
  styleUrl: './earth-nasa.component.scss'
})
export class EarthNasaComponent implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  @ViewChild('leafletMapContainer', { static: true }) leafletMapContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  planetEarth = signal<THREE.Mesh | undefined>(undefined);
  private atmosphere!: THREE.Mesh;
  private stars!: THREE.Points;
  private sunLight!: THREE.DirectionalLight;
  private sunSphere!: THREE.Mesh; // Representación visual del sol

  // Controles
  isRotating = true;
  useRealTime = true; // Nueva propiedad para activar/desactivar tiempo real
  manualRotationSpeed = 0.002; // Velocidad manual cuando no usa tiempo real
  cameraDistance = 20;

  // Variables de tiempo
  currentDate = signal<Date>(new Date());
  earthRotation = signal<number>(0);
  sunPosition = signal<THREE.Vector3>(new THREE.Vector3());

  private leafletMap: L.Map | null = null;
  private leafletCanvas: HTMLCanvasElement | null = null;
  private leafletTexture: THREE.CanvasTexture | null = null;
  private animationId: number = 0;
  private isTextureReady = false;
  private leafletCanvasLayer: any = null;

  // Constantes astronómicas
  private readonly EARTH_ROTATION_PERIOD = 24 * 60 * 60 * 1000; // 24 horas en ms
  private readonly EARTH_ORBITAL_PERIOD = 365.25 * 24 * 60 * 60 * 1000; // 1 año en ms
  private readonly EARTH_AXIAL_TILT = 23.44; // Inclinación axial de la Tierra en grados
  private readonly SUN_DISTANCE = 80; // Distancia visual del sol

  ngOnInit(): void {  

    this.initLeafletMap().then(() => {
      this.initScene();
      this.updateAstronomicalPositions();
      this.animate();
      
      // Actualizar posiciones cada minuto
      setInterval(() => {
        if (this.useRealTime) {
          this.updateAstronomicalPositions();
        }
      }, 60000);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.leafletMap) {
      this.leafletMap.remove();
    }
    this.renderer?.dispose();
  }

  // Calcula la posición de la Tierra basada en la fecha y hora actual
  private calculateEarthRotation(date: Date): number {
    // Calcular rotación basada en la hora del día
    const msInDay = date.getHours() * 3600000 + 
                   date.getMinutes() * 60000 + 
                   date.getSeconds() * 1000 + 
                   date.getMilliseconds();
    
    // La Tierra rota 360° en 24 horas
    const rotationRadians = (msInDay / this.EARTH_ROTATION_PERIOD) * 2 * Math.PI;
    
    // Ajuste para que el mediodía solar esté aproximadamente en el meridiano de Greenwich
    // (esto es una simplificación, en realidad dependería de la ecuación del tiempo)
    return rotationRadians - Math.PI; // Offset de 180° para orientación correcta
  }

  // Calcula la posición del Sol basada en la fecha
  private calculateSunPosition(date: Date): THREE.Vector3 {
    // Calcular día del año
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    
    // Calcular la declinación solar (simplificado)
    const dayAngle = (2 * Math.PI * dayOfYear) / 365.25;
    const declination = this.EARTH_AXIAL_TILT * Math.sin(dayAngle - (81 * 2 * Math.PI / 365.25));
    const declinationRadians = (declination * Math.PI) / 180;
    
    // Calcular hora solar
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    const hourAngle = (hour - 12) * 15; // 15° por hora
    const hourAngleRadians = (hourAngle * Math.PI) / 180;
    
    // Posición del Sol en coordenadas esféricas
    const sunX = this.SUN_DISTANCE * Math.cos(declinationRadians) * Math.cos(hourAngleRadians);
    const sunY = this.SUN_DISTANCE * Math.sin(declinationRadians);
    const sunZ = this.SUN_DISTANCE * Math.cos(declinationRadians) * Math.sin(hourAngleRadians);
    
    return new THREE.Vector3(sunX, sunY, sunZ);
  }

  // Actualiza todas las posiciones astronómicas
  private updateAstronomicalPositions(): void {
    const now = new Date();
    this.currentDate.set(now);
    
    if (this.useRealTime) {
      // Actualizar rotación de la Tierra
      const rotation = this.calculateEarthRotation(now);
      this.earthRotation.set(rotation);
      
      if (this.planetEarth()) {
        this.planetEarth()!.rotation.y = rotation;
        // Aplicar inclinación axial
        this.planetEarth()!.rotation.z = (this.EARTH_AXIAL_TILT * Math.PI) / 180;
      }
    }
    
    // Actualizar posición del Sol
    const sunPos = this.calculateSunPosition(now);
    this.sunPosition.set(sunPos);
    
    if (this.sunLight) {
      this.sunLight.position.copy(sunPos);
      this.sunLight.lookAt(0, 0, 0);
    }
    
    if (this.sunSphere) {
      this.sunSphere.position.copy(sunPos);
    }
  }

  // Inicializa el mapa Leaflet con canvas personalizado
  private async initLeafletMap(): Promise<void> {
    // Crear canvas personalizado para el mapa
    this.leafletCanvas = document.createElement('canvas');
    this.leafletCanvas.width = 2048;
    this.leafletCanvas.height = 1024;
    this.leafletCanvas.style.position = 'absolute';
    this.leafletCanvas.style.visibility = 'hidden';
    this.leafletMapContainer.nativeElement.appendChild(this.leafletCanvas);

    // Configurar el mapa Leaflet
    this.leafletMap = leaflet.map(this.leafletMapContainer.nativeElement, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      preferCanvas: true
    });

    // Crear capa de canvas personalizada
    const CanvasLayer = (leaflet as any).Layer.extend({
      initialize: (canvas: HTMLCanvasElement) => {
        this.leafletCanvas = canvas;
      },
      onAdd: (map: L.Map) => {
        this.setupCanvasRendering(map);
      },
      onRemove: () => {}
    });

    this.leafletCanvasLayer = new CanvasLayer(this.leafletCanvas);
    this.leafletMap!.addLayer(this.leafletCanvasLayer);

    // Agregar tile layer
    const tileLayer = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 1,
      maxZoom: 4,
      subdomains: ['a', 'b', 'c']
    });  
 
    tileLayer.addTo(this.leafletMap); 
    await this.setupCanvasRendering(this.leafletMap!);
  }

  private async setupCanvasRendering(map: L.Map): Promise<void> {
    if (!this.leafletCanvas) return;

    const ctx = this.leafletCanvas.getContext('2d');
    if (!ctx) return;

    const renderMapToCanvas = () => {
      if (!this.leafletCanvas || !ctx || !map) return;
      ctx.clearRect(0, 0, this.leafletCanvas.width, this.leafletCanvas.height);
      const worldBounds = map.getBounds();
      const zoom = map.getZoom();
      this.renderTilesToCanvas(ctx, worldBounds, zoom);
    };

    map.on('moveend zoomend', renderMapToCanvas);
    map.on('layeradd', () => {
      setTimeout(renderMapToCanvas, 500);
    });

    setTimeout(() => {
      renderMapToCanvas();
      this.createTextureFromCanvas();
    }, 1000);
  }

  private renderTilesToCanvas(ctx: CanvasRenderingContext2D, bounds: L.LatLngBounds, zoom: number) {
    if (!this.leafletCanvas) return;

    const worldWidth = this.leafletCanvas.width;
    const worldHeight = this.leafletCanvas.height;
    const numTilesX = Math.pow(2, zoom);
    const numTilesY = Math.pow(2, zoom);
    const tileWidth = worldWidth / numTilesX;
    const tileHeight = worldHeight / numTilesY;

    for (let x = 0; x < numTilesX; x++) {
      for (let y = 0; y < numTilesY; y++) {
        this.loadAndDrawTile(ctx, x, y, zoom, tileWidth, tileHeight);
      }
    }
  }

  private loadAndDrawTile(
    ctx: CanvasRenderingContext2D,
    tileX: number,
    tileY: number,
    zoom: number,
    tileWidth: number,
    tileHeight: number
  ) { 
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const subdomains = ['a', 'b', 'c'];
    const subdomain = subdomains[(tileX + tileY) % subdomains.length];
    
    img.onload = () => {
      const x = tileX * tileWidth;
      const y = tileY * tileHeight;
      ctx.drawImage(img, x, y, tileWidth, tileHeight);
      
      if (this.leafletTexture) {
        this.leafletTexture.needsUpdate = true;
      }  
    };

    img.onerror = () => {
      ctx.fillStyle = '#4a90e2';
      ctx.fillRect(tileX * tileWidth, tileY * tileHeight, tileWidth, tileHeight);
    };

    img.src = `https://${subdomain}.tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
  }

  private createTextureFromCanvas() {
    if (!this.leafletCanvas) return;

    this.leafletTexture = new THREE.CanvasTexture(this.leafletCanvas);
    this.leafletTexture.wrapS = THREE.RepeatWrapping;
    this.leafletTexture.wrapT = THREE.RepeatWrapping;
    this.leafletTexture.flipY = true; 
    this.leafletTexture.generateMipmaps = false;
    this.leafletTexture.minFilter = THREE.LinearFilter;
    this.leafletTexture.magFilter = THREE.LinearFilter;

    this.isTextureReady = true;

    if (this.planetEarth()) {
      const material = this.planetEarth()!.material as THREE.MeshPhongMaterial;
      material.map = this.leafletTexture;
      material.needsUpdate = true;
    }
  }

  private initScene() {
    const container = this.rendererContainer.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Cámara
    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 2000);
    this.camera.position.set(0, 0, this.cameraDistance);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Controles de órbita
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 12;
    this.controls.maxDistance = 150;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;

    // Tierra
    const sphereGeometry = new THREE.SphereGeometry(10, 128, 64);
    const material = new THREE.MeshPhongMaterial({
      map: this.leafletTexture,
      shininess: 30,
      specular: new THREE.Color(0x111111),
      bumpScale: 0.1
    });

    // Cargar texture de bump
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1206469/earthbump1k.jpg',
      (bumpMap) => {
        material.bumpMap = bumpMap;
        material.needsUpdate = true;
      }
    );

    this.planetEarth.set(new THREE.Mesh(sphereGeometry, material));
    this.planetEarth()!.castShadow = true;
    this.planetEarth()!.receiveShadow = true;
    this.scene.add(this.planetEarth()!);

    // Atmósfera
    this.createAtmosphere();

    // Sol visual
    this.createSun();

    // Estrellas
    this.addStars();

    // Iluminación
    this.setupLighting();

    // Resize handler
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createSun() {
    // Crear representación visual del Sol usando MeshStandardMaterial
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.6,
      roughness: 1.0,
      metalness: 0.0
    });
    
    this.sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sunSphere);

    // Añadir halo al sol
    const haloGeometry = new THREE.SphereGeometry(4, 32, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    this.sunSphere.add(halo);
  }

  private createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(10.5, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          float glow = sin(time * 0.5) * 0.1 + 0.9;
          vec3 atmosColor = vec3(0.3, 0.6, 1.0) * glow;
          gl_FragColor = vec4(atmosColor, intensity * 0.8);
        }
      `,
      uniforms: {
        time: { value: 0.0 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    
    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(this.atmosphere);
  }

  private addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 1500 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);

      const intensity = 0.5 + Math.random() * 0.5;
      colors[i] = intensity;
      colors[i + 1] = intensity * (0.8 + Math.random() * 0.2);
      colors[i + 2] = intensity * (0.6 + Math.random() * 0.4);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  private setupLighting() {
    // Sol (luz principal) - posición se actualiza dinámicamente
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 200;
    this.sunLight.shadow.camera.left = -50;
    this.sunLight.shadow.camera.right = 50;
    this.sunLight.shadow.camera.top = 50;
    this.sunLight.shadow.camera.bottom = -50;
    this.scene.add(this.sunLight);

    // Luz ambiental muy suave (luz de las estrellas)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    this.scene.add(ambientLight);

    // Luz de relleno (reflexión de luz solar en la Luna y otros planetas)
    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.15);
    fillLight.position.set(-50, -20, -30);
    this.scene.add(fillLight);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.001;

    // Actualizar textura de Leaflet
    if (this.isTextureReady && this.leafletTexture && this.planetEarth()) {
      const material = this.planetEarth()!.material as THREE.MeshPhongMaterial;
      if (material.map !== this.leafletTexture) {
        material.map = this.leafletTexture;
        this.leafletTexture.needsUpdate = true;
        material.needsUpdate = true;
      }
    }

    // Rotación del planeta
    if (this.isRotating && this.planetEarth()) {
      if (this.useRealTime) {
        // Actualizar cada segundo para mantener precisión
        if (Math.floor(time) % 1 === 0) {
          this.updateAstronomicalPositions();
        }
      } else {
        // Rotación manual
        this.planetEarth()!.rotation.y += this.manualRotationSpeed;
      }
    }

    // Animación de atmósfera
    if (this.atmosphere?.material) {
      const material = this.atmosphere.material as THREE.ShaderMaterial;
      const uniforms = material.uniforms as AtmosphereUniforms;
      if (uniforms.time) {
        uniforms.time.value = time;
      }
    }

    // Rotación sutil de las estrellas
    if (this.stars) {
      this.stars.rotation.y += 0.00005;
    }

    // Animación sutil del Sol
    if (this.sunSphere) {
      this.sunSphere.rotation.y += 0.01;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize() {
    const container = this.rendererContainer.nativeElement;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Controles UI
  toggleRotation() {
    this.isRotating = !this.isRotating;
  }

  toggleRealTime() {
    this.useRealTime = !this.useRealTime;
    if (this.useRealTime) {
      this.updateAstronomicalPositions();
    }
  }

  resetView() {
    this.camera.position.set(0, 0, this.cameraDistance);
    this.controls.reset();
  }

  changeRotationSpeed(speed: number) {
    this.manualRotationSpeed = speed;
  }

  toggleAutoOrbit() {
    this.controls.autoRotate = !this.controls.autoRotate;
  }

  refreshTexture() {
    if (this.leafletMap) {
      this.leafletMap.fire('moveend');
    }
  }

  // Nuevos métodos para controlar el tiempo
  setCustomDate(date: Date) {
    this.currentDate.set(date);
    this.updateAstronomicalPositions();
  }

  getCurrentLocalTime(): string {
    return this.currentDate().toLocaleTimeString();
  }

  getCurrentDate(): string {
    return this.currentDate().toLocaleDateString();
  }

  getSunPosition(): { elevation: number, azimuth: number } {
    const pos = this.sunPosition();
    const elevation = Math.atan2(pos.y, Math.sqrt(pos.x * pos.x + pos.z * pos.z)) * 180 / Math.PI;
    const azimuth = Math.atan2(pos.x, pos.z) * 180 / Math.PI;
    return { elevation: Math.round(elevation), azimuth: Math.round(azimuth) };
  }

  /**const material = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(
          'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1206469/earthmap1k.jpg'
        ),
        shininess: 50,
        specular: new THREE.Color(0x333333)
      }); */
}