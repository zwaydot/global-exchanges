import React, { useEffect, useRef, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { Exchange } from '../types';

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

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('pointerdown', handleInteraction);

    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.6;
      
      // Responsive initial view
      const isMobile = window.innerWidth < 640;
      // Increase altitude on mobile (2.5) to fit the globe in narrower width
      // Keep closer (1.7) on desktop for impact
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: isMobile ? 2.5 : 1.7 });
    }

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
    };
  }, []);

  // Format data for rings (pulsating effect for volume)
  const ringsData = useMemo(() => {
    return exchanges.map(e => ({
      lat: e.lat,
      lng: e.lng,
      maxR: Math.log(e.dailyVolumeBillionUSD + 1) * 3, // Log scale for visual balance
      propagationSpeed: 1.5,
      repeatPeriod: 800,
      // Color: Gold/Amber fading out, matching the "glitter" aesthetic
      color: (t: number) => `rgba(251, 191, 36, ${1 - t})`, 
    }));
  }, [exchanges]);

  // Format data for labels with collision detection (Repulsion Logic)
  const labelsData = useMemo(() => {
    // 1. Create nodes with mutable position properties
    const nodes = exchanges.map(e => ({
      ...e,
      lLat: e.lat,
      lLng: e.lng,
      // Heuristic radius based on text length
      radius: 1.5 + (e.id.length * 0.4) 
    }));

    // 2. Iterative repulsion to separate close labels
    const ITERATIONS = 50; 
    const REPULSION_STRENGTH = 0.3;
    const ANCHOR_STRENGTH = 0.05; // Force pulling label back to its origin

    for (let iter = 0; iter < ITERATIONS; iter++) {
      // Repulsion phase
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          
          // Calculate approximate distance on sphere surface
          // We adjust longitude difference by the cosine of the latitude
          const avgLatRad = (n1.lLat + n2.lLat) / 2 * (Math.PI / 180);
          const cosLat = Math.max(0.1, Math.cos(avgLatRad)); // Clamp to avoid div/0
          
          let dLat = n1.lLat - n2.lLat;
          let dLng = n1.lLng - n2.lLng;

          // Simple wrap-around check
          if (dLng > 180) dLng -= 360;
          if (dLng < -180) dLng += 360;

          // Convert longitude diff to "visual degrees"
          const visualDLng = dLng * cosLat;
          
          const distSq = dLat * dLat + visualDLng * visualDLng;
          const minSpacing = n1.radius + n2.radius;
          
          if (distSq < minSpacing * minSpacing) {
            const dist = Math.sqrt(distSq);
            const overlap = minSpacing - dist;
            
            let dx = visualDLng;
            let dy = dLat;

            // Handle stacked case
            if (dist < 0.01) {
                dx = (Math.random() - 0.5); 
                dy = 1.0; 
            } else {
                dx /= dist;
                dy /= dist;
            }

            // Apply Repulsion Force
            const moveLng = (dx * overlap * REPULSION_STRENGTH) / cosLat;
            const moveLat = dy * overlap * REPULSION_STRENGTH;
            
            n1.lLng += moveLng;
            n1.lLat += moveLat;
            n2.lLng -= moveLng;
            n2.lLat -= moveLat;
          }
        }
      }
      
      // Attraction Phase (Return to Origin)
      // Prevents labels from drifting too far from their actual location
      nodes.forEach(n => {
        const latDiff = n.lat - n.lLat;
        let lngDiff = n.lng - n.lLng;
        
        if (lngDiff > 180) lngDiff -= 360;
        if (lngDiff < -180) lngDiff += 360;

        n.lLat += latDiff * ANCHOR_STRENGTH;
        n.lLng += lngDiff * ANCHOR_STRENGTH;
      });
    }

    // Return formatted data for Globe
    return nodes.map(node => ({
      lat: node.lLat,
      lng: node.lLng,
      text: node.id.toUpperCase(),
      size: 1.1, 
      color: 'rgba(255, 255, 255, 0.9)',
      exchangeData: node // Attach original data for click handling
    }));
  }, [exchanges]);

  const handleFocus = (lat: number, lng: number, data: Exchange) => {
    isFocused.current = true;
    lastFocusTime.current = Date.now();
    updateRotation();
    
    onSelect(data);
    
    if (globeEl.current) {
      // Keep altitude slightly higher on mobile focus too
      const isMobile = window.innerWidth < 640;
      globeEl.current.pointOfView({ lat, lng, altitude: isMobile ? 2.0 : 1.5 }, 1000);
    }
  };

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      
      // Rings (Volume Visualization Base) - Now Gold
      ringsData={ringsData}
      ringColor="color"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      
      // Labels (Names)
      labelsData={labelsData}
      labelLat="lat"
      labelLng="lng"
      labelText="text"
      labelSize="size"
      labelColor="color"
      labelDotRadius={0} // Hide dot for labels
      labelAltitude={0.01}
      
      // Custom Layer: 3D Volume Bars
      customLayerData={exchanges}
      customThreeObject={(d: any) => {
        const { dailyVolumeBillionUSD } = d as Exchange;
        const altitude = Math.sqrt(dailyVolumeBillionUSD) * 0.007;
        const radius = 0.4; 
        
        const geometry = new THREE.CylinderGeometry(radius, radius, altitude, 8);
        geometry.translate(0, altitude / 2, 0);
        
        // Use Gold/Amber Material for the columns
        const material = new THREE.MeshLambertMaterial({ 
          color: '#fbbf24', // Amber-400/Gold
          transparent: true, 
          opacity: 0.9 
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
      }}
      
      // Interaction
      onCustomLayerHover={(obj: any) => {
        isHovering.current = !!obj;
        updateRotation();
        document.body.style.cursor = obj ? 'pointer' : 'default';
      }}
      onCustomLayerClick={(obj: any) => {
        const data = obj.__data as Exchange;
        if (data) {
          handleFocus(data.lat, data.lng, data);
        }
      }}
      onLabelHover={(label: any) => {
        isHovering.current = !!label;
        updateRotation();
        document.body.style.cursor = label ? 'pointer' : 'default';
      }}
      onLabelClick={(label: any) => {
        const data = label.exchangeData;
        if (data) {
           handleFocus(data.lat, data.lng, data);
        }
      }}
    />
  );
};

export default GlobeViz;