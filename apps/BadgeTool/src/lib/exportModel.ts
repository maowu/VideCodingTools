import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { buildMedalGroup, disposeObject3D } from "@/lib/modelBuilder";
import type { MedalSettings } from "@/lib/types";

export async function exportMedalGlb(
  svgText: string,
  settings: MedalSettings,
): Promise<Blob> {
  const group = buildMedalGroup(svgText, settings, null, "export");
  const exporter = new GLTFExporter();

  try {
    return await new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        group,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(
              new Blob([result], {
                type: "model/gltf-binary",
              }),
            );
            return;
          }

          resolve(
            new Blob([JSON.stringify(result, null, 2)], {
              type: "model/gltf+json",
            }),
          );
        },
        (error) => reject(error),
        { binary: true },
      );
    });
  } finally {
    disposeObject3D(group);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
