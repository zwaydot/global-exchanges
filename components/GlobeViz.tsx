import React, { useEffect, useRef, useMemo, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { Exchange } from '../types';
import { trackExchangeClick, trackMarkerClick } from '../lib/analytics';

interface GlobeVizProps {
  exchanges: Exchange[];
  onSelect: (exchange: Exchange) => void;
}

const GlobeViz: React.FC<GlobeVizProps> = ({ exchanges, onSelect }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  
  // Interaction state refs (using refs to avoid re-renders causing Globe resets)
  const isHovering = useRef(false);
  const isFocused = useRef(false);
  const lastFocusTime = useRef(0);

  // Centralized rotation control
  const updateRotation = () => {
    if (globeEl.current) {
      const shouldRotate = !isHovering.current && !isFocused.current;
      globeEl.current.controls().autoRotate = shouldRotate;
    }
  };

  // Setup global interaction listeners to resume rotation
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      // Only attempt to resume if we are currently focused/paused
      if (isFocused.current) {
        // Resume on drag (pointerdown) immediately
        if (e.type === 'pointerdown') {
          isFocused.current = false;
          updateRotation();
        } 
        // Resume on mousemove, but add a small buffer (200ms) 
        // to prevent the micro-movements during the click itself from resuming immediately
        else if (e.type === 'mousemove') {
          if (Date.now() - lastFocusTime.current > 200) {
            isFocused.current = false;
            updateRotation();
          }
        }
      }
    };

    // Handle Context Menu blocking
    const handleContextMenu = (e: MouseEvent) => {
        // We want to allow the browser context menu, but OrbitControls might block it.
        // Usually OrbitControls only blocks if we are dragging with right click.
        // If we just want to ensure right-click works on other elements, we can stop propagation if needed
        // but usually Three.js canvas consumes events.
        // For now, we attach a passive listener to ensuring we don't preventDefault globally
    };

    document.addEventListener('contextmenu', handleContextMenu, { passive: true });
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('pointerdown', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onSelect]); // Add onSelect dependency if it changes (though it usually doesn't)

  // Initialize Globe Scene (Brightness & Custom Stars)
  useEffect(() => {
    // Delay slightly to ensure Globe is mounted and ref is populated
    const initTimer = setTimeout(() => {
        if (!globeEl.current) return;
        
        try {
            const globe = globeEl.current;
            const scene = globe.scene();
            
            // 0. 优化渲染器设置以提升清晰度
            const renderer = globe.renderer();
            if (renderer) {
                // 设置高像素比率以提升清晰度（特别是高DPI屏幕）
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                // 确保抗锯齿已启用
                if (!renderer.antialias) {
                    console.warn('Renderer antialias not enabled');
                }
            }
            
            // 1. Config Lighting (Brightness) - 大幅增强亮度
            // Add Ambient Light
            if (!scene.getObjectByName('custom-ambient-light')) {
                const ambientLight = new THREE.AmbientLight(0xffffff, 2.8); // 大幅增强环境光
                ambientLight.name = 'custom-ambient-light';
                scene.add(ambientLight);
            }
            // Add Directional Light for highlights
            if (!scene.getObjectByName('custom-dir-light')) {
                const dirLight = new THREE.DirectionalLight(0xffffff, 4.0); // 大幅增强定向光
                dirLight.position.set(50, 50, 50);
                dirLight.name = 'custom-dir-light';
                scene.add(dirLight);
            }
            // 添加额外的定向光从另一侧，增加整体亮度
            if (!scene.getObjectByName('custom-dir-light-2')) {
                const dirLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
                dirLight2.position.set(-30, 30, -30);
                dirLight2.name = 'custom-dir-light-2';
                scene.add(dirLight2);
            }

            // 2. Config Material - 大幅增强材质自发光 + 优化纹理清晰度
            const updateMaterial = () => {
                // globeMaterial() might not be available immediately or might be a function depending on version
                // Safe check for globeMaterial
                let mat;
                try {
                     // @ts-ignore
                     mat = globe.globeMaterial();
                } catch(e) {
                    // Ignore if function not found
                }

                if (mat && mat instanceof THREE.MeshPhongMaterial) {
                    mat.color = new THREE.Color(0xffffff);
                    mat.emissive = new THREE.Color(0x444444); // 大幅增强自发光颜色
                    mat.emissiveIntensity = 0.5; // 大幅增强自发光强度
                    mat.shininess = 25;
                    // 增加高光反射，让地球更亮
                    mat.specular = new THREE.Color(0x222222);
                    
                    // 优化纹理过滤以提升清晰度
                    if (mat.map) {
                        const renderer = globe.renderer();
                        if (renderer) {
                            // 使用高质量纹理过滤
                            mat.map.minFilter = THREE.LinearMipMapLinearFilter;
                            mat.map.magFilter = THREE.LinearFilter;
                            mat.map.generateMipmaps = true;
                            // 设置各向异性过滤（提升纹理清晰度）
                            mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                            mat.map.needsUpdate = true;
                        }
                    }
                }
            };
            updateMaterial();
            // Retry mechanism to ensure material settings stick after texture load
            // Globe texture loading is async, so we check a few times
            setTimeout(updateMaterial, 1000);
            setTimeout(updateMaterial, 3000);
            setTimeout(updateMaterial, 5000); // 额外重试，确保纹理完全加载后优化
            
            // 优化纹理过滤设置（如果纹理已加载）
            const updateTextureFilter = () => {
                try {
                    const mat = globe.globeMaterial();
                    if (mat && mat.map) {
                        const renderer = globe.renderer();
                        if (renderer) {
                            // 使用高质量过滤以提升放大后的清晰度
                            mat.map.minFilter = THREE.LinearMipMapLinearFilter;
                            mat.map.magFilter = THREE.LinearFilter;
                            mat.map.generateMipmaps = true;
                            // 设置各向异性过滤（提升纹理清晰度）
                            mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                            mat.map.needsUpdate = true;
                        }
                    }
                } catch(e) {
                    // Texture might not be loaded yet
                }
            };
            // 延迟执行，等待纹理加载
            setTimeout(updateTextureFilter, 500);
            setTimeout(updateTextureFilter, 2000);

            // 3. Add Custom Stars (with varying sizes and brightness)
            if (!scene.getObjectByName('custom-stars')) {
                const starCount = 4000;
                const starGroup = new THREE.Group();
                starGroup.name = 'custom-stars';
                starGroup.renderOrder = -1; // Render behind everything

                // 创建三组不同大小的星星，模拟真实星空的层次感
                const starLayers = [
                    { count: Math.floor(starCount * 0.65), size: 1.2, brightnessRange: [0.3, 0.6] }, // 小星星，较暗（大多数）
                    { count: Math.floor(starCount * 0.25), size: 2.0, brightnessRange: [0.5, 0.8] }, // 中等星星
                    { count: Math.floor(starCount * 0.10), size: 3.5, brightnessRange: [0.7, 1.0] } // 大星星，较亮（少数）
                ];

                starLayers.forEach((layer, layerIndex) => {
                    const starGeometry = new THREE.BufferGeometry();
                    const starPositions = new Float32Array(layer.count * 3);
                    const starColors = new Float32Array(layer.count * 3); // RGB for each star

                    for (let i = 0; i < layer.count; i++) {
                        // 随机位置
                        const r = 400 + Math.random() * 600;
                        const theta = 2 * Math.PI * Math.random();
                        const phi = Math.acos(2 * Math.random() - 1);

                        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                        starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                        starPositions[i * 3 + 2] = r * Math.cos(phi);

                        // 随机亮度（金色 #fbbf24 = rgb(251, 191, 36)）
                        const brightness = layer.brightnessRange[0] + Math.random() * (layer.brightnessRange[1] - layer.brightnessRange[0]);
                        starColors[i * 3] = 251 / 255 * brightness;     // R
                        starColors[i * 3 + 1] = 191 / 255 * brightness; // G
                        starColors[i * 3 + 2] = 36 / 255 * brightness;  // B
                    }

                    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
                    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

                    // 使用 PointsMaterial，每组星星统一大小，但每个星星有不同的颜色（亮度）
                    const starMaterial = new THREE.PointsMaterial({
                        size: layer.size,
                        sizeAttenuation: false, // 固定大小，不随距离变化
                        transparent: true,
                        opacity: 1.0, // 使用 vertexColors 来控制每个点的亮度
                        depthWrite: false,
                        vertexColors: true // 启用每个点的独立颜色
                    });

                    const stars = new THREE.Points(starGeometry, starMaterial);
                    stars.name = `custom-stars-layer-${layerIndex}`;
                    starGroup.add(stars);
                });

                scene.add(starGroup);
            }
            
            // 4. Initial Controls & View
            const controls = globe.controls();
            if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.6;
                // Ensure controls don't block the view
                controls.minDistance = 101; // Prevent going inside
                controls.maxDistance = 1000;
            }
            
            const isMobile = window.innerWidth < 640;
            globe.pointOfView({ lat: 20, lng: 0, altitude: isMobile ? 4.0 : 2 }); // 增加观察距离，让地球在视觉上更小

        } catch (e) {
            console.error("Globe initialization error:", e);
        }
    }, 100); // Short delay after mount

    return () => clearTimeout(initTimer);
  }, []);

  // Format data for rings (pulsating effect for volume)
  const ringsData = useMemo(() => {
    return exchanges.map(e => {
      // Calculate logarithmic radius based on volume
      const rawR = Math.log((e.monthlyTradeValueBillionUSD / 20) + 1) * 3;
      // Enforce a minimum visibility radius (0.8 degrees) so even small exchanges have a faint ring
      const maxR = Math.max(rawR, 0.8);
      
      return {
        lat: e.lat,
        lng: e.lng,
        maxR, 
        propagationSpeed: 1.5,
        repeatPeriod: 800,
        // Color: Gold/Amber fading out - 大交易所的波形图更亮
        color: (t: number) => {
          const isMajor = e.monthlyTradeValueBillionUSD > 50;
          const baseOpacity = isMajor ? 0.9 : 0.7; // 大交易所初始更亮
          return `rgba(251, 191, 36, ${baseOpacity * (1 - t)})`;
        }, 
      };
    });
  }, [exchanges]);

  // Points Data: Show a dot for ALL exchanges (interactive targets)
  // This ensures even if label is hidden, the exchange is visible and clickable.
  const pointsData = useMemo(() => {
    return exchanges.map(e => {
      const isMajor = e.monthlyTradeValueBillionUSD > 50;
      return {
        lat: e.lat,
        lng: e.lng,
        size: isMajor ? 0.6 : 0.4, // 大交易所的点更大，更明显
        color: isMajor ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)', // Gold for big, White-ish for small
        data: e,
        label: `${e.name} (${e.id.toUpperCase()})` // Tooltip text
      };
    });
  }, [exchanges]);

  // Format data for labels (Text)
  // Strategy: Only show labels for major exchanges to reduce clutter
  const labelsData = useMemo(() => {
    // Filter: Only show labels for exchanges with > $50B monthly volume OR strategic ones manually picked if needed
    // Adjust threshold as needed to clear up Europe
    const VISIBILITY_THRESHOLD_USD_B = 50;

    const visibleExchanges = exchanges.filter(e => e.monthlyTradeValueBillionUSD > VISIBILITY_THRESHOLD_USD_B);

    // 1. Create nodes with mutable position properties
    const nodes = visibleExchanges.map(e => ({
      ...e,
      lLat: e.lat,
      lLng: e.lng,
      // Heuristic radius based on text length - 减小半径，让标签更靠近原始位置
      radius: 1.2 + (e.id.length * 0.3) 
    }));

    // 2. Iterative repulsion to separate close labels (优先保持靠近原始位置)
    const ITERATIONS = 50; // 减少迭代次数，避免过度分离
    const REPULSION_STRENGTH = 0.25; // 减小排斥力，让标签分开但不会离太远
    const ANCHOR_STRENGTH = 0.15; // 大幅增强锚点强度，确保标签始终靠近原始坐标位置 

    for (let iter = 0; iter < ITERATIONS; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          
          const avgLatRad = (n1.lLat + n2.lLat) / 2 * (Math.PI / 180);
          const cosLat = Math.max(0.1, Math.cos(avgLatRad));
          
          let dLat = n1.lLat - n2.lLat;
          let dLng = n1.lLng - n2.lLng;

          if (dLng > 180) dLng -= 360;
          if (dLng < -180) dLng += 360;

          const visualDLng = dLng * cosLat;
          
          const distSq = dLat * dLat + visualDLng * visualDLng;
          const minSpacing = n1.radius + n2.radius;
          
          if (distSq < minSpacing * minSpacing) {
            const dist = Math.sqrt(distSq);
            const overlap = minSpacing - dist;
            
            let dx = visualDLng;
            let dy = dLat;

            if (dist < 0.01) {
                dx = (Math.random() - 0.5); 
                dy = 1.0; 
            } else {
                dx /= dist;
                dy /= dist;
            }

            const moveLng = (dx * overlap * REPULSION_STRENGTH) / cosLat;
            const moveLat = dy * overlap * REPULSION_STRENGTH;
            
            n1.lLng += moveLng;
            n1.lLat += moveLat;
            n2.lLng -= moveLng;
            n2.lLat -= moveLat;
          }
        }
      }
      
      nodes.forEach(n => {
        const latDiff = n.lat - n.lLat;
        let lngDiff = n.lng - n.lLng;
        
        if (lngDiff > 180) lngDiff -= 360;
        if (lngDiff < -180) lngDiff += 360;

        n.lLat += latDiff * ANCHOR_STRENGTH;
        n.lLng += lngDiff * ANCHOR_STRENGTH;
      });
    }

    return nodes.map(node => ({
      lat: node.lLat,
      lng: node.lLng,
      text: node.id.toUpperCase(),
      size: 1.1, 
      color: 'rgba(178, 231, 194, 0.95)',
      exchangeData: node
    }));
  }, [exchanges]);

  const handleFocus = (lat: number, lng: number, data: Exchange, source: 'label' | 'point' | 'marker' | 'custom_layer' = 'point') => {
    isFocused.current = true;
    lastFocusTime.current = Date.now();
    updateRotation();
    
    // 追踪点击事件
    trackExchangeClick(data.id, data.name, source);
    
    onSelect(data);
    
    if (globeEl.current) {
      const isMobile = window.innerWidth < 640;
      globeEl.current.pointOfView({ lat, lng, altitude: isMobile ? 2.5 : 2.0 }, 1000); // 增加观察距离，让地球在视觉上更小
    }
  };

  return (
    <Globe
      ref={globeEl}
      rendererConfig={{ antialias: true }}
      globeImageUrl="https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-night.jpg"
      backgroundColor="rgba(0,0,0,0)" // Transparent to let CSS background show or custom scene background
      
      // Rings (Volume Visualization)
      ringsData={ringsData}
      ringColor="color"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      
      // Points (Interactive Dots for ALL exchanges)
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointRadius="size"
      pointAltitude={0.01}
      // Use point label as a simple tooltip
      pointLabel="label" 
      
      // Labels (Text for Major Exchanges Only)
      labelsData={labelsData}
      labelLat="lat"
      labelLng="lng"
      labelText="text"
      labelSize="size"
      labelColor="color"
      labelDotRadius={0.15} // 显示连接点，让标签和坐标点的对应关系更清晰
      labelDotColor="rgba(251, 191, 36, 0.6)" // 金色半透明连接点
      labelAltitude={0.01}
      
      // Custom Layer: 3D Beacons (Glowing Light Columns)
      customLayerData={exchanges}
      customLayerLat="lat"
      customLayerLng="lng"
      customThreeObject={(d: any) => {
        const exchange = d as Exchange;
        const { monthlyTradeValueBillionUSD } = exchange;
        // Ensure even small exchanges have a tiny bar
        const dailyApprox = Math.max(monthlyTradeValueBillionUSD / 20, 0.5); 
        const altitude = Math.sqrt(dailyApprox) * 0.007;
        const radius = 0.12; // Thinner for beacon look
        
        const geometry = new THREE.CylinderGeometry(radius, radius, altitude, 8);
        geometry.translate(0, altitude / 2, 0);
        
        // Use Phong material with Emissive for glowing effect
        const material = new THREE.MeshPhongMaterial({ 
          color: '#fbbf24',        // Base Gold
          emissive: '#fbbf24',     // Glow Color
          emissiveIntensity: 0.8,  // Glow Strength
          transparent: true, 
          opacity: 0.85
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        // Manually attach exchange data to the mesh for click handling
        (mesh as any).userData = { exchange };
        return mesh;
      }}
      
      // Interaction
      // Handle clicks on Points (Small exchanges)
      onPointClick={(point: any) => {
        const data = point.data as Exchange;
        if (data) handleFocus(data.lat, data.lng, data, 'point');
      }}
      onPointHover={(point: any) => {
        isHovering.current = !!point;
        updateRotation();
        document.body.style.cursor = point ? 'pointer' : 'default';
      }}

      // Handle clicks on Custom Layer (Bars)
      onCustomLayerHover={(obj: any) => {
        isHovering.current = !!obj;
        updateRotation();
        document.body.style.cursor = obj ? 'pointer' : 'default';
      }}
      onCustomLayerClick={(obj: any) => {
        // Try multiple ways to access the data
        let data: Exchange | null = null;
        
        // Method 1: Check userData (manually attached)
        if (obj?.userData?.exchange) {
          data = obj.userData.exchange;
        }
        // Method 2: Check __data (react-globe.gl default)
        else if (obj?.__data) {
          data = obj.__data as Exchange;
        }
        // Method 3: If obj itself has lat/lng, it might be the data
        else if (obj && typeof obj === 'object' && 'lat' in obj && 'lng' in obj) {
          data = obj as Exchange;
        }
        // Method 4: Fallback - find by position (if we can get world position)
        else if (obj && obj.position) {
          // This is a fallback - try to find exchange by matching position
          // Note: This is less reliable but can work if other methods fail
          console.warn('[GlobeViz] Could not find exchange data directly, attempting position match');
        }
        
        if (data && typeof data === 'object' && 'lat' in data && 'lng' in data) {
          // 追踪标记柱点击（3D 柱子）
          trackMarkerClick(data.id, data.name);
          handleFocus(data.lat, data.lng, data, 'custom_layer');
        } else {
          console.warn('[GlobeViz] Failed to extract exchange data from custom layer click', obj);
        }
      }}

      // Handle clicks on Labels (Major exchanges text)
      onLabelHover={(label: any) => {
        isHovering.current = !!label;
        updateRotation();
        document.body.style.cursor = label ? 'pointer' : 'default';
      }}
      onLabelClick={(label: any) => {
        const data = label.exchangeData;
        if (data) handleFocus(data.lat, data.lng, data, 'label');
      }}
    />
  );
};

export default GlobeViz;
