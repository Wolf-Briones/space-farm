// earth.component.ts - GLOBO TERRÁQUEO ULTRA REALISTA
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface LocationData {
  city: string;
  country: string;
  coordinates: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-earth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.scss']
})
export class EarthComponent implements OnInit, OnDestroy {
  @ViewChild('earthCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() startGame = new EventEmitter<LocationData>();

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private earth!: THREE.Mesh;
  private atmosphere!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private locationMarker!: THREE.Mesh;
  private animationId!: number;
  private stars!: THREE.Points;
  private galaxy!: THREE.Points;
  private moon!: THREE.Mesh;
  private sun!: THREE.DirectionalLight;

  // Component state
  isLoading = false;
  showLocationCard = false;
  showStartButton = false;
  showPermissionRequest = true;

  locationData: LocationData = {
    city: 'Cajamarca',
    country: 'Perú',
    coordinates: 'Cajamarca • -7.1650, -78.5028',
    latitude: -7.1650,
    longitude: -78.5028
  };

  // Texturas y materiales
  private earthTexture!: THREE.Texture;
  private normalTexture!: THREE.Texture;
  private specularTexture!: THREE.Texture;
  private cloudsTexture!: THREE.Texture;
  private nightTexture!: THREE.Texture;

  ngOnInit(): void {
    this.checkLocationPermission();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private async checkLocationPermission(): Promise<void> {
    if ('geolocation' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          this.showPermissionRequest = false;
          this.getCurrentLocation();
        }
      } catch (error) {
        console.log('Permission API not supported');
      }
    }
  }

  requestLocation(): void {
    this.showPermissionRequest = false;
    this.getCurrentLocation();
  }

  useDefaultLocation(): void {
    this.showPermissionRequest = false;
    this.initializeEarth();
    this.showLocationInfo();
  }

  private getCurrentLocation(): void {
    this.isLoading = true;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await this.getLocationInfo(latitude, longitude);
          this.isLoading = false;
          this.initializeEarth();
          this.showLocationInfo();
        },
        (error) => {
          console.error('Error getting location:', error);
          this.isLoading = false;
          this.initializeEarth();
          this.showLocationInfo();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    } else {
      this.isLoading = false;
      this.initializeEarth();
      this.showLocationInfo();
    }
  }

  private async getLocationInfo(latitude: number, longitude: number): Promise<void> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
      );
      const data = await response.json();

      this.locationData = {
        city: data.city || data.locality || 'Ciudad Desconocida',
        country: data.countryName || 'País Desconocido',
        coordinates: `${data.city || data.locality || 'Ubicación'} • ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude
      };
    } catch (error) {
      console.error('Error getting location info:', error);
      this.locationData.latitude = latitude;
      this.locationData.longitude = longitude;
      this.locationData.coordinates = `Ubicación • ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  private initializeEarth(): void {
    this.setupScene();
    this.createStarField();
    this.createGalaxy();
    this.createRealisticEarth();
    this.createAtmosphere();
    this.createClouds();
    this.createMoon();
    this.createLocationMarker();
    this.setupRealisticLighting();
    this.startAnimation();
    this.setupResize();
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 350, 1000);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.6;
  }

  private createStarField(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Distribución esférica de estrellas
      const radius = 500 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Colores de estrellas realistas
      const starType = Math.random();
      if (starType < 0.7) {
        // Estrellas blancas/amarillas
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3;
      } else if (starType < 0.9) {
        // Estrellas azules
        colors[i * 3] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Estrellas rojas
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
      }

      sizes[i] = 0.5 + Math.random() * 2;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  private createGalaxy(): void {
    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyCount = 15000;
    const positions = new Float32Array(galaxyCount * 3);
    const colors = new Float32Array(galaxyCount * 3);

    for (let i = 0; i < galaxyCount; i++) {
      // Forma de galaxia espiral
      const angle = (i / galaxyCount) * Math.PI * 8;
      const radius = 200 + (i / galaxyCount) * 800;
      const heightVariation = (Math.random() - 0.5) * 100;

      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = heightVariation;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 50;

      // Colores galácticos
      const distance = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
      const normalizedDistance = distance / 1000;
      
      colors[i * 3] = 0.8 + normalizedDistance * 0.2;     // R
      colors[i * 3 + 1] = 0.6 + normalizedDistance * 0.4; // G
      colors[i * 3 + 2] = 0.9 + normalizedDistance * 0.1; // B
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.8,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    this.galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
    this.galaxy.rotation.x = Math.PI / 3;
    this.scene.add(this.galaxy);
  }

  private createRealisticEarth(): void {
    // Crear texturas realistas usando canvas para simular imágenes reales
    this.earthTexture = this.createEarthDayTexture();
    this.nightTexture = this.createEarthNightTexture();
    this.normalTexture = this.createNormalTexture();
    this.specularTexture = this.createSpecularTexture();

    const earthGeometry = new THREE.SphereGeometry(2, 128, 128);

    // Shader material personalizado para efectos día/noche
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: this.earthTexture },
        nightTexture: { value: this.nightTexture },
        normalTexture: { value: this.normalTexture },
        specularTexture: { value: this.specularTexture },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D normalTexture;
        uniform sampler2D specularTexture;
        uniform vec3 sunDirection;
        uniform float time;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(sunDirection);
          
          float NdotL = dot(normal, lightDir);
          float dayNightMix = smoothstep(-0.1, 0.1, NdotL);
          
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          vec4 normalMap = texture2D(normalTexture, vUv);
          vec4 specular = texture2D(specularTexture, vUv);
          
          // Mezcla día/noche
          vec4 color = mix(nightColor, dayColor, dayNightMix);
          
          // Efectos de specular en océanos
          float specularStrength = specular.r * max(0.0, NdotL);
          color.rgb += specularStrength * 0.5;
          
          // Efecto de atmósfera en los bordes
          vec3 viewDirection = normalize(-vPosition);
          float fresnel = pow(1.0 - dot(normal, viewDirection), 2.0);
          color.rgb += fresnel * vec3(0.3, 0.6, 1.0) * 0.3;
          
          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `
    });

    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
    this.earth.castShadow = true;
    this.earth.receiveShadow = true;
    this.scene.add(this.earth);
  }

  private createEarthDayTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Océanos azules realistas como en la imagen
    ctx.fillStyle = '#4A90E2'; // Azul océano real
    ctx.fillRect(0, 0, 2048, 1024);

    // Color verde realista de los continentes (como en la imagen)
    ctx.fillStyle = '#7ED321'; // Verde brillante realista

    // NORTE AMÉRICA - Forma más precisa
    ctx.beginPath();
    // Canadá
    ctx.moveTo(200, 200);
    ctx.bezierCurveTo(300, 180, 400, 190, 500, 220);
    ctx.bezierCurveTo(520, 240, 500, 280, 480, 300);
    // Estados Unidos
    ctx.bezierCurveTo(450, 320, 400, 330, 350, 340);
    ctx.bezierCurveTo(300, 350, 250, 360, 200, 350);
    // México
    ctx.bezierCurveTo(180, 380, 190, 400, 220, 420);
    ctx.bezierCurveTo(250, 400, 280, 390, 300, 380);
    ctx.bezierCurveTo(280, 360, 240, 320, 200, 280);
    ctx.closePath();
    ctx.fill();

    // SUR AMÉRICA - Forma característica
    ctx.beginPath();
    ctx.moveTo(380, 480);
    // Colombia/Venezuela
    ctx.bezierCurveTo(420, 460, 450, 480, 460, 510);
    // Brasil (lado este)
    ctx.bezierCurveTo(480, 550, 490, 600, 480, 650);
    ctx.bezierCurveTo(470, 700, 450, 750, 430, 800);
    // Argentina/Chile
    ctx.bezierCurveTo(410, 850, 390, 880, 380, 900);
    ctx.bezierCurveTo(370, 880, 360, 850, 350, 800);
    // Oeste de Sur América
    ctx.bezierCurveTo(340, 750, 330, 700, 335, 650);
    ctx.bezierCurveTo(340, 600, 350, 550, 360, 510);
    ctx.bezierCurveTo(365, 490, 370, 480, 380, 480);
    ctx.closePath();
    ctx.fill();

    // ÁFRICA - Forma distintiva
    ctx.beginPath();
    ctx.moveTo(1000, 350);
    // Norte de África
    ctx.bezierCurveTo(1050, 330, 1100, 340, 1150, 360);
    ctx.bezierCurveTo(1180, 380, 1170, 420, 1160, 460);
    // África Oriental
    ctx.bezierCurveTo(1170, 500, 1180, 550, 1170, 600);
    ctx.bezierCurveTo(1160, 650, 1150, 700, 1130, 750);
    // Sur de África
    ctx.bezierCurveTo(1110, 780, 1080, 790, 1050, 785);
    ctx.bezierCurveTo(1020, 780, 990, 770, 970, 750);
    // África Occidental
    ctx.bezierCurveTo(950, 700, 940, 650, 945, 600);
    ctx.bezierCurveTo(950, 550, 960, 500, 970, 460);
    ctx.bezierCurveTo(975, 420, 985, 380, 1000, 350);
    ctx.closePath();
    ctx.fill();

    // EUROPA - Más detallada
    ctx.beginPath();
    ctx.moveTo(950, 250);
    ctx.bezierCurveTo(980, 240, 1020, 245, 1050, 260);
    ctx.bezierCurveTo(1070, 280, 1060, 300, 1040, 310);
    ctx.bezierCurveTo(1000, 320, 960, 315, 930, 300);
    ctx.bezierCurveTo(920, 280, 930, 260, 950, 250);
    ctx.closePath();
    ctx.fill();

    // ASIA - Continente grande
    ctx.beginPath();
    ctx.moveTo(1100, 200);
    // Siberia
    ctx.bezierCurveTo(1200, 180, 1350, 190, 1500, 210);
    ctx.bezierCurveTo(1600, 220, 1700, 240, 1750, 270);
    // Asia Oriental
    ctx.bezierCurveTo(1780, 300, 1770, 350, 1750, 400);
    ctx.bezierCurveTo(1720, 450, 1680, 480, 1630, 500);
    // India
    ctx.bezierCurveTo(1580, 520, 1520, 540, 1480, 520);
    ctx.bezierCurveTo(1450, 500, 1430, 470, 1420, 440);
    // Asia Central
    ctx.bezierCurveTo(1400, 400, 1380, 360, 1350, 320);
    ctx.bezierCurveTo(1300, 280, 1250, 250, 1200, 230);
    ctx.bezierCurveTo(1150, 210, 1120, 200, 1100, 200);
    ctx.closePath();
    ctx.fill();

    // AUSTRALIA - Forma característica
    ctx.beginPath();
    ctx.ellipse(1550, 720, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // GROENLANDIA - Isla grande
    ctx.beginPath();
    ctx.ellipse(650, 150, 60, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // ISLAS BRITÁNICAS
    ctx.beginPath();
    ctx.ellipse(920, 280, 25, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // JAPÓN
    ctx.beginPath();
    ctx.ellipse(1720, 350, 15, 60, Math.PI/6, 0, Math.PI * 2);
    ctx.fill();

    // MADAGASCAR
    ctx.beginPath();
    ctx.ellipse(1200, 750, 12, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // NUEVA ZELANDA
    ctx.beginPath();
    ctx.ellipse(1680, 820, 15, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Casquetes polares - Blanco como la imagen
    ctx.fillStyle = '#FFFFFF';
    // Ártico
    ctx.fillRect(0, 0, 2048, 60);
    // Antártida
    ctx.fillRect(0, 964, 2048, 60);

    // Agregar variación de color para hacer más realista
    // Áreas verdes más oscuras (bosques)
    ctx.fillStyle = '#5BA815';
    
    // Amazonas
    ctx.beginPath();
    ctx.ellipse(380, 550, 40, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Congo
    ctx.beginPath();
    ctx.ellipse(1020, 550, 35, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bosques de Canadá
    ctx.fillRect(250, 200, 200, 40);

    // Taiga siberiana
    ctx.fillRect(1200, 200, 300, 30);

    return new THREE.CanvasTexture(canvas);
  }

  private createEarthNightTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Fondo oscuro
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, 2048, 1024);

    // Luces de ciudades
    ctx.fillStyle = '#ffff88';
    
    // Ciudades principales con puntos de luz
    const cities = [
      // Norte América
      [300, 250], [350, 280], [400, 300], [320, 320],
      // Europa
      [950, 220], [980, 240], [1020, 230], [1050, 250],
      // Asia
      [1200, 280], [1300, 300], [1400, 280], [1450, 320],
      // Sur América
      [400, 550], [420, 600], [450, 650],
      // África
      [1000, 450], [1050, 500], [1100, 480],
      // Australia
      [1480, 700], [1520, 710]
    ];

    cities.forEach(([x, y]) => {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
      glow.addColorStop(0, '#ffff88');
      glow.addColorStop(0.5, '#ffaa44');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 15, y - 15, 30, 30);
    });

    return new THREE.CanvasTexture(canvas);
  }

  private createNormalTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Mapa normal básico (azul/púrpura para profundidad)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 1024, 512);

    // Añadir variación para montañas y océanos
    const imageData = ctx.getImageData(0, 0, 1024, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 0.2 - 0.1;
      data[i] = Math.max(0, Math.min(255, 128 + noise * 255));     // R
      data[i + 1] = Math.max(0, Math.min(255, 128 + noise * 255)); // G  
      data[i + 2] = Math.max(0, Math.min(255, 255));               // B
      data[i + 3] = 255;                                           // A
    }

    ctx.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
  }

  private createSpecularTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Blanco para océanos (especular - reflejan el sol)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Negro para continentes (sin especular - no reflejan)
    ctx.fillStyle = '#000000';
    
    // Usar exactamente las mismas formas que el mapa diurno
    
    // NORTE AMÉRICA
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.bezierCurveTo(300, 180, 400, 190, 500, 220);
    ctx.bezierCurveTo(520, 240, 500, 280, 480, 300);
    ctx.bezierCurveTo(450, 320, 400, 330, 350, 340);
    ctx.bezierCurveTo(300, 350, 250, 360, 200, 350);
    ctx.bezierCurveTo(180, 380, 190, 400, 220, 420);
    ctx.bezierCurveTo(250, 400, 280, 390, 300, 380);
    ctx.bezierCurveTo(280, 360, 240, 320, 200, 280);
    ctx.closePath();
    ctx.fill();

    // SUR AMÉRICA
    ctx.beginPath();
    ctx.moveTo(380, 480);
    ctx.bezierCurveTo(420, 460, 450, 480, 460, 510);
    ctx.bezierCurveTo(480, 550, 490, 600, 480, 650);
    ctx.bezierCurveTo(470, 700, 450, 750, 430, 800);
    ctx.bezierCurveTo(410, 850, 390, 880, 380, 900);
    ctx.bezierCurveTo(370, 880, 360, 850, 350, 800);
    ctx.bezierCurveTo(340, 750, 330, 700, 335, 650);
    ctx.bezierCurveTo(340, 600, 350, 550, 360, 510);
    ctx.bezierCurveTo(365, 490, 370, 480, 380, 480);
    ctx.closePath();
    ctx.fill();

    // ÁFRICA
    ctx.beginPath();
    ctx.moveTo(1000, 350);
    ctx.bezierCurveTo(1050, 330, 1100, 340, 1150, 360);
    ctx.bezierCurveTo(1180, 380, 1170, 420, 1160, 460);
    ctx.bezierCurveTo(1170, 500, 1180, 550, 1170, 600);
    ctx.bezierCurveTo(1160, 650, 1150, 700, 1130, 750);
    ctx.bezierCurveTo(1110, 780, 1080, 790, 1050, 785);
    ctx.bezierCurveTo(1020, 780, 990, 770, 970, 750);
    ctx.bezierCurveTo(950, 700, 940, 650, 945, 600);
    ctx.bezierCurveTo(950, 550, 960, 500, 970, 460);
    ctx.bezierCurveTo(975, 420, 985, 380, 1000, 350);
    ctx.closePath();
    ctx.fill();

    // EUROPA
    ctx.beginPath();
    ctx.moveTo(950, 250);
    ctx.bezierCurveTo(980, 240, 1020, 245, 1050, 260);
    ctx.bezierCurveTo(1070, 280, 1060, 300, 1040, 310);
    ctx.bezierCurveTo(1000, 320, 960, 315, 930, 300);
    ctx.bezierCurveTo(920, 280, 930, 260, 950, 250);
    ctx.closePath();
    ctx.fill();

    // ASIA
    ctx.beginPath();
    ctx.moveTo(1100, 200);
    ctx.bezierCurveTo(1200, 180, 1350, 190, 1500, 210);
    ctx.bezierCurveTo(1600, 220, 1700, 240, 1750, 270);
    ctx.bezierCurveTo(1780, 300, 1770, 350, 1750, 400);
    ctx.bezierCurveTo(1720, 450, 1680, 480, 1630, 500);
    ctx.bezierCurveTo(1580, 520, 1520, 540, 1480, 520);
    ctx.bezierCurveTo(1450, 500, 1430, 470, 1420, 440);
    ctx.bezierCurveTo(1400, 400, 1380, 360, 1350, 320);
    ctx.bezierCurveTo(1300, 280, 1250, 250, 1200, 230);
    ctx.bezierCurveTo(1150, 210, 1120, 200, 1100, 200);
    ctx.closePath();
    ctx.fill();

    // AUSTRALIA
    ctx.beginPath();
    ctx.ellipse(1550, 720, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // GROENLANDIA
    ctx.beginPath();
    ctx.ellipse(650, 150, 60, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // ISLAS BRITÁNICAS
    ctx.beginPath();
    ctx.ellipse(920, 280, 25, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // JAPÓN
    ctx.beginPath();
    ctx.ellipse(1720, 350, 15, 60, Math.PI/6, 0, Math.PI * 2);
    ctx.fill();

    // MADAGASCAR
    ctx.beginPath();
    ctx.ellipse(1200, 750, 12, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // NUEVA ZELANDA
    ctx.beginPath();
    ctx.ellipse(1680, 820, 15, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Casquetes polares (hielo - especular medio)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 2048, 60);
    ctx.fillRect(0, 964, 2048, 60);

    return new THREE.CanvasTexture(canvas);
  }

  private createAtmosphere(): void {
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
          gl_FragColor = vec4(atmosphere, intensity * 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(this.atmosphere);
  }

  private createClouds(): void {
    const cloudsTexture = this.createCloudsTexture();
    
    const cloudsGeometry = new THREE.SphereGeometry(2.005, 64, 64);
    const cloudsMaterial = new THREE.MeshLambertMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.NormalBlending
    });

    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    this.scene.add(this.clouds);
  }

  private createCloudsTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Transparente por defecto
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 1024, 512);

    // Crear patrones de nubes realistas
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = 20 + Math.random() * 80;
      const opacity = 0.3 + Math.random() * 0.4;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.7})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    return new THREE.CanvasTexture(canvas);
  }

  private createMoon(): void {
    const moonGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const moonTexture = this.createMoonTexture();
    
    const moonMaterial = new THREE.MeshPhongMaterial({
      map: moonTexture,
      shininess: 1
    });

    this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moon.position.set(8, 2, 0);
    this.moon.castShadow = true;
    this.scene.add(this.moon);
  }

  private createMoonTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base gris de la luna
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 512, 512);

    // Cráteres
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 5 + Math.random() * 30;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#555555');
      gradient.addColorStop(0.7, '#666666');
      gradient.addColorStop(1, '#888888');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  private createLocationMarker(): void {
    const phi = (90 - this.locationData.latitude) * (Math.PI / 180);
    const theta = (this.locationData.longitude + 180) * (Math.PI / 180);

    const x = 2.02 * Math.sin(phi) * Math.cos(theta);
    const y = 2.02 * Math.cos(phi);
    const z = 2.02 * Math.sin(phi) * Math.sin(theta);

    // Marcador principal
    const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const markerMaterial = new THREE.MeshPhongMaterial({
      color: 0xff1493,
      emissive: 0xff1493,
      emissiveIntensity: 0.5
    });

    this.locationMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.locationMarker.position.set(x, y, z);
    this.scene.add(this.locationMarker);

    // Efecto de onda expansiva
    const pulseGeometry = new THREE.RingGeometry(0.05, 0.08, 16);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xff1493,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.copy(this.locationMarker.position);
    pulse.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(pulse);

    this.animateMarker();
  }

  private animateMarker(): void {
    const animate = () => {
      if (this.locationMarker) {
        const time = Date.now() * 0.003;
        const scale = 1 + Math.sin(time) * 0.5;
        this.locationMarker.scale.setScalar(scale);
      }
      setTimeout(() => animate(), 50);
    };
    animate();
  }

  private setupRealisticLighting(): void {
    // Luz del sol
    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.position.set(5, 0, 5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 50;
    this.scene.add(this.sun);

    // Luz ambiental tenue del espacio
    const ambientLight = new THREE.AmbientLight(0x111122, 0.3);
    this.scene.add(ambientLight);

    // Luz de la galaxia (muy sutil)
    const galaxyLight = new THREE.PointLight(0x4444ff, 0.2, 1000);
    galaxyLight.position.set(100, 100, 100);
    this.scene.add(galaxyLight);

    // Luz reflejada de la luna
    const moonLight = new THREE.PointLight(0xffffff, 0.1, 20);
    moonLight.position.copy(this.moon.position);
    this.scene.add(moonLight);
  }

  private startAnimation(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.0005;

      // Rotación de la Tierra (24 horas = 1 rotación completa)
      if (this.earth) {
        this.earth.rotation.y += 0.001;
      }

      // Rotación de nubes (ligeramente más rápida)
      if (this.clouds) {
        this.clouds.rotation.y += 0.0012;
      }

      // Rotación de la atmósfera
      if (this.atmosphere) {
        this.atmosphere.rotation.y += 0.0008;
      }

      // Órbita de la luna alrededor de la Tierra
      if (this.moon) {
        const moonOrbitRadius = 8;
        this.moon.position.x = Math.cos(time * 0.1) * moonOrbitRadius;
        this.moon.position.z = Math.sin(time * 0.1) * moonOrbitRadius;
        this.moon.position.y = Math.sin(time * 0.05) * 2;
        this.moon.rotation.y += 0.001;
      }

      // Movimiento del sol (simular el día/noche)
      if (this.sun) {
        this.sun.position.x = Math.cos(time * 0.05) * 10;
        this.sun.position.z = Math.sin(time * 0.05) * 10;
        this.sun.position.y = Math.sin(time * 0.025) * 5;
      }

      // Rotación lenta de las estrellas
      if (this.stars) {
        this.stars.rotation.y += 0.0001;
        this.stars.rotation.x += 0.00005;
      }

      // Rotación de la galaxia
      if (this.galaxy) {
        this.galaxy.rotation.z += 0.0002;
        this.galaxy.rotation.y += 0.0001;
      }

      // Actualizar posición del marcador con la rotación de la Tierra
      if (this.locationMarker && this.earth) {
        const phi = (90 - this.locationData.latitude) * (Math.PI / 180);
        const theta = (this.locationData.longitude + 180) * (Math.PI / 180) + this.earth.rotation.y;

        const x = 2.02 * Math.sin(phi) * Math.cos(theta);
        const y = 2.02 * Math.cos(phi);
        const z = 2.02 * Math.sin(phi) * Math.sin(theta);

        this.locationMarker.position.set(x, y, z);
      }

      // Efecto de cámara orbital suave
      const cameraRadius = 8;
      const cameraSpeed = time * 0.1;
      this.camera.position.x = Math.cos(cameraSpeed) * cameraRadius;
      this.camera.position.z = Math.sin(cameraSpeed) * cameraRadius;
      this.camera.position.y = Math.sin(cameraSpeed * 0.5) * 2;
      this.camera.lookAt(0, 0, 0);

      // Actualizar shaders con el tiempo
      if (this.earth.material instanceof THREE.ShaderMaterial) {
        this.earth.material.uniforms['time'].value = time;
        this.earth.material.uniforms['sunDirection'].value.copy(this.sun.position).normalize();
      }

      if (this.atmosphere.material instanceof THREE.ShaderMaterial) {
        this.atmosphere.material.uniforms['time'].value = time;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private showLocationInfo(): void {
    setTimeout(() => {
      this.showLocationCard = true;
      setTimeout(() => {
        this.showStartButton = true;
      }, 1000);
    }, 500);
  }

  startSpaceFarm(): void {
    this.startGame.emit(this.locationData);
  }

  // Método para obtener la hora actual
  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}