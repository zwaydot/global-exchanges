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

    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      
      // Responsive initial view
      const isMobile = window.innerWidth < 640;
      // Increase altitude on mobile (2.5) to fit the globe in narrower width
      // Keep closer (1.7) on desktop for impact
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: isMobile ? 2.5 : 1.7 });
    }

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onSelect]); // Add onSelect dependency if it changes (though it usually doesn't)

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
        // Color: Gold/Amber fading out
        color: (t: number) => `rgba(251, 191, 36, ${1 - t})`, 
      };
    });
  }, [exchanges]);

  // Points Data: Show a dot for ALL exchanges (interactive targets)
  // This ensures even if label is hidden, the exchange is visible and clickable.
  const pointsData = useMemo(() => {
    return exchanges.map(e => ({
      lat: e.lat,
      lng: e.lng,
      size: 0.4, // Small clickable dot
      color: e.monthlyTradeValueBillionUSD > 50 ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)', // Gold for big, White-ish for small
      data: e,
      label: `${e.name} (${e.id.toUpperCase()})` // Tooltip text
    }));
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
      // Heuristic radius based on text length
      radius: 1.5 + (e.id.length * 0.4) 
    }));

    // 2. Iterative repulsion to separate close labels (Same logic as before)
    const ITERATIONS = 50; 
    const REPULSION_STRENGTH = 0.3;
    const ANCHOR_STRENGTH = 0.05; 

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

  const handleFocus = (lat: number, lng: number, data: Exchange) => {
    isFocused.current = true;
    lastFocusTime.current = Date.now();
    updateRotation();
    
    onSelect(data);
    
    if (globeEl.current) {
      const isMobile = window.innerWidth < 640;
      globeEl.current.pointOfView({ lat, lng, altitude: isMobile ? 2.0 : 1.5 }, 1000);
    }
  };

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      
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
      labelDotRadius={0} // Hide the dot built into the label layer, we use pointsLayer for that
      labelAltitude={0.01}
      
      // Custom Layer: 3D Beacons (Glowing Light Columns)
      customLayerData={exchanges}
      customThreeObject={(d: any) => {
        const { monthlyTradeValueBillionUSD } = d as Exchange;
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
        
        return new THREE.Mesh(geometry, material);
      }}
      
      // Interaction
      // Handle clicks on Points (Small exchanges)
      onPointClick={(point: any) => {
        const data = point.data as Exchange;
        if (data) handleFocus(data.lat, data.lng, data);
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
        const data = obj.__data as Exchange;
        if (data) handleFocus(data.lat, data.lng, data);
      }}

      // Handle clicks on Labels (Major exchanges text)
      onLabelHover={(label: any) => {
        isHovering.current = !!label;
        updateRotation();
        document.body.style.cursor = label ? 'pointer' : 'default';
      }}
      onLabelClick={(label: any) => {
        const data = label.exchangeData;
        if (data) handleFocus(data.lat, data.lng, data);
      }}
    />
  );
};

export default GlobeViz;
