import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import { buildMedalGroup, disposeObject3D, type BuildQuality } from "@/lib/modelBuilder";
import {
  HOME_PREVIEW_ROTATION_X,
  HOME_PREVIEW_ROTATION_Y,
} from "@/lib/previewPose";
import type { MedalSettings } from "@/lib/types";

interface ModelPreviewProps {
  svgText: string;
  settings: MedalSettings;
  highlightedPathIndex: number | null;
  quality?: BuildQuality;
}

function MedalModel({
  svgText,
  settings,
  highlightedPathIndex,
  quality = "preview",
}: ModelPreviewProps) {
  const group = useMemo(
    () => buildMedalGroup(svgText, settings, highlightedPathIndex, quality),
    [highlightedPathIndex, quality, settings, svgText],
  );

  useEffect(() => {
    return () => disposeObject3D(group);
  }, [group]);

  return <primitive object={group} />;
}

function CanvasResizer() {
  const gl = useThree((state) => state.gl);
  const setSize = useThree((state) => state.setSize);

  useEffect(() => {
    const element = gl.domElement.parentElement?.parentElement;
    if (!element) {
      return undefined;
    }

    const resize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize(rect.width, rect.height);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [gl, setSize]);

  return null;
}

function FloorGrid() {
  return (
    <gridHelper
      args={[8, 16, "#4a5462", "#242d38"]}
      position={[0, 0, -0.56]}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}

export function ModelPreview(props: ModelPreviewProps) {
  return (
    <div className="canvas-wrap">
      <Canvas
        camera={{ position: [0, -7, 5.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        resize={{ offsetSize: true }}
        shadows={props.settings.canvas.showShadows}
        style={{ height: "100%", width: "100%" }}
      >
        <color attach="background" args={[props.settings.canvas.backgroundColor]} />
        <ambientLight intensity={0.62} />
        <directionalLight
          intensity={2.2}
          position={[4.5, -5.5, 8]}
        />
        <directionalLight intensity={0.65} position={[-5, 3, 4]} />
        <Suspense fallback={null}>
          <CanvasResizer />
          <group rotation={[HOME_PREVIEW_ROTATION_X, HOME_PREVIEW_ROTATION_Y, 0]}>
            <MedalModel {...props} />
          </group>
          <Environment preset="city" />
          {props.settings.canvas.showShadows ? (
            <ContactShadows
              opacity={0.34}
              position={[0, 0, -0.54]}
              scale={8}
              blur={2.4}
              far={4}
            />
          ) : null}
          {props.settings.canvas.showGrid ? <FloorGrid /> : null}
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2.5}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
