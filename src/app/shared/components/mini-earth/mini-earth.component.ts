// mini-earth.component.ts
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface LocationData {
  city: string;
  country: string;
  coordinates: string;
  latitude: number;
  longitude: number;
}

interface FarmPlot {
  id: number;
  planted: boolean;
  irrigated: boolean;
  cropIcon: string;
}

@Component({
  selector: 'app-mini-earth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-earth.component.html',
  styleUrls: ['./mini-earth.component.scss']
})
export class MiniEarthComponent implements OnInit, OnDestroy {
  @ViewChild('earthCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() farmPlots: FarmPlot[] = [];
  @Input() locationData: LocationData = {
    city: 'Cajamarca',
    country: 'Perú',
    coordinates: 'Cajamarca • -7.1650, -78.5028',
    latitude: -7.1650,
    longitude: -78.5028
  };

  @Output() plotClicked = new EventEmitter<FarmPlot>();

  // Component state
  isExpanded = false;
  isLoading = false;
  isRotating = true;
  zoomLevel = 100;

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private earth!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private locationMarker!: THREE.Mesh;
  private animationId!: number;
  private mouse = new THREE.Vector2();
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };

  private earthTexture!: THREE.Texture;
  private cloudsTexture!: THREE.Texture;

  ngOnInit(): void {
    // El canvas se inicializa cuando se expande la vista
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  toggleView(): void {
    this.isExpanded = !this.isExpanded;
    
    if (this.isExpanded && !this.scene) {
      this.isLoading = true;
      setTimeout(() => {
        this.initializeEarth();
        this.isLoading = false;
      }, 100);
    }
  }

  private initializeEarth(): void {
    if (!this.canvasRef?.nativeElement) return;

    this.setupScene();
    this.createEarth();
    this.createClouds();
    this.createLocationMarker();
    this.setupLighting();
    this.setupControls();
    this.startAnimation();
    this.setupResize();
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();

    // Camera
    const aspect = this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.z = 2.5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true
    });
    
    const canvas = this.canvasRef.nativeElement;
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private createEarth(): void {
    // Create earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Create realistic earth texture
    const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
    gradient.addColorStop(0, '#4a7c4a');
    gradient.addColorStop(0.3, '#6b8e6b');
    gradient.addColorStop(0.7, '#8fbc8f');
    gradient.addColorStop(1, '#4a7c4a');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Add continents (simplified)
    ctx.fillStyle = '#2e5c2e';
    // North America
    ctx.fillRect(150, 180, 200, 150);
    // South America
    ctx.fillRect(250, 280, 120, 180);
    // Europe/Africa
    ctx.fillRect(450, 160, 180, 250);
    // Asia
    ctx.fillRect(600, 140, 250, 200);
    // Australia
    ctx.fillRect(750, 350, 100, 80);

    // Add ocean areas
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 200, 140, 150);
    ctx.fillRect(370, 180, 80, 200);
    ctx.fillRect(520, 300, 150, 100);

    this.earthTexture = new THREE.CanvasTexture(canvas);

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: this.earthTexture,
      shininess: 0.1
    });

    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
    this.scene.add(this.earth);
  }

  private createClouds(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Create cloud pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const radius = Math.random() * 25 + 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    this.cloudsTexture = new THREE.CanvasTexture(canvas);

    const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: this.cloudsTexture,
      transparent: true,
      opacity: 0.3
    });

    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    this.scene.add(this.clouds);
  }

  private createLocationMarker(): void {
    const phi = (90 - this.locationData.latitude) * (Math.PI / 180);
    const theta = (this.locationData.longitude + 180) * (Math.PI / 180);

    const x = 1.02 * Math.sin(phi) * Math.cos(theta);
    const y = 1.02 * Math.cos(phi);
    const z = 1.02 * Math.sin(phi) * Math.sin(theta);

    const markerGeometry = new THREE.SphereGeometry(0.025, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4081
    });

    this.locationMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.locationMarker.position.set(x, y, z);
    this.scene.add(this.locationMarker);

    this.animateMarker();
  }

  private animateMarker(): void {
    const animate = () => {
      if (this.locationMarker) {
        const time = Date.now() * 0.005;
        const scale = 1 + Math.sin(time) * 0.4;
        this.locationMarker.scale.setScalar(scale);
      }
      setTimeout(() => animate(), 50);
    };
    animate();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 0.5);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4fc3f7, 0.3, 10);
    pointLight.position.set(2, 0, 2);
    this.scene.add(pointLight);
  }

  private setupControls(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    });

    canvas.addEventListener('mousemove', (event) => {
      if (this.isDragging && this.earth) {
        const deltaMove = {
          x: event.clientX - this.previousMousePosition.x,
          y: event.clientY - this.previousMousePosition.y
        };

        this.earth.rotation.y += deltaMove.x * 0.01;
        this.earth.rotation.x += deltaMove.y * 0.01;

        if (this.clouds) {
          this.clouds.rotation.y = this.earth.rotation.y;
          this.clouds.rotation.x = this.earth.rotation.x;
        }

        this.previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.z *= delta;
      this.camera.position.z = Math.max(1.5, Math.min(5, this.camera.position.z));
      this.updateZoomLevel();
    });
  }

  private startAnimation(): void {
    const animate = () => {
      if (!this.isExpanded) return;
      
      this.animationId = requestAnimationFrame(animate);

      if (this.isRotating && this.earth) {
        this.earth.rotation.y += 0.002;
        if (this.clouds) {
          this.clouds.rotation.y += 0.003;
        }
      }

      // Update location marker position
      if (this.locationMarker && this.earth) {
        const phi = (90 - this.locationData.latitude) * (Math.PI / 180);
        const theta = (this.locationData.longitude + 180) * (Math.PI / 180) + this.earth.rotation.y;

        const x = 1.02 * Math.sin(phi) * Math.cos(theta);
        const y = 1.02 * Math.cos(phi);
        const z = 1.02 * Math.sin(phi) * Math.sin(theta);

        this.locationMarker.position.set(x, y, z);
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  private setupResize(): void {
    const resizeObserver = new ResizeObserver(() => {
      if (this.canvasRef?.nativeElement && this.camera && this.renderer) {
        const canvas = this.canvasRef.nativeElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });

    if (this.canvasRef?.nativeElement) {
      resizeObserver.observe(this.canvasRef.nativeElement);
    }
  }

  private updateZoomLevel(): void {
    const minZoom = 5;
    const maxZoom = 1.5;
    const currentZoom = this.camera.position.z;
    this.zoomLevel = Math.round(((maxZoom - currentZoom) / (maxZoom - minZoom)) * 150 + 50);
  }

  // Public methods for controls
  zoomIn(): void {
    this.camera.position.z *= 0.9;
    this.camera.position.z = Math.max(1.5, this.camera.position.z);
    this.updateZoomLevel();
  }

  zoomOut(): void {
    this.camera.position.z *= 1.1;
    this.camera.position.z = Math.min(5, this.camera.position.z);
    this.updateZoomLevel();
  }

  resetView(): void {
    this.camera.position.z = 2.5;
    if (this.earth) {
      this.earth.rotation.x = 0;
      this.earth.rotation.y = 0;
    }
    if (this.clouds) {
      this.clouds.rotation.x = 0;
      this.clouds.rotation.y = 0;
    }
    this.updateZoomLevel();
  }

  toggleRotation(): void {
    this.isRotating = !this.isRotating;
  }

  // Farm grid methods
  onPlotClick(plot: FarmPlot): void {
    this.plotClicked.emit(plot);
  }

  getPlotClasses(plot: FarmPlot): string {
    let classes = 'farm-plot';
    if (plot.planted) classes += ' planted';
    if (plot.irrigated) classes += ' irrigated';
    return classes;
  }

  private cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}