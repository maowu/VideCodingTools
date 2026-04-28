import vtracerInit, { to_svg } from "vtracer-wasm";
import wasmUrl from "vtracer-wasm/vtracer.wasm?url";

const MAX_DIMENSION = 1024;

let wasmReady = false;

async function ensureWasm() {
  if (!wasmReady) {
    try {
      await vtracerInit({ module_or_path: wasmUrl });
      wasmReady = true;
    } catch (e) {
      console.error("[pngToSvg] WASM init failed:", e);
      throw e;
    }
  }
}

export interface PngTracingOptions {
  /** Use binary (B&W) tracing mode. Default: false */
  binary?: boolean;
  /** Path simplification mode. Default: "spline" */
  mode?: "spline" | "polygon" | "pixel";
  /** Hierarchical clustering: "stacked" or "cutout". Default: "stacked" */
  hierarchical?: "stacked" | "cutout";
  /** Discard patches smaller than X px (noise filter). Default: 4 */
  filterSpeckle?: number;
  /** Significant color bits per channel (1–8). Default: 6 */
  colorPrecision?: number;
  /** Layer difference for color clustering. Default: 16 */
  layerDifference?: number;
  /** Corner angle threshold in degrees. Default: 60 */
  cornerThreshold?: number;
  /** Target segment length for curve fitting. Default: 4.0 */
  lengthThreshold?: number;
  /** Max path fitting iterations. Default: 10 */
  maxIterations?: number;
  /** Splice angle threshold in degrees. Default: 45 */
  spliceThreshold?: number;
  /** Path coordinate decimal precision. Default: 3 */
  pathPrecision?: number;
}

function scaleCanvas(
  source: HTMLCanvasElement,
  maxDimension: number,
): HTMLCanvasElement {
  const { width, height } = source;

  if (width <= maxDimension && height <= maxDimension) {
    return source;
  }

  const scale = maxDimension / Math.max(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return source;
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Converts a PNG File to an SVG string using VTracer (WASM). */
export async function pngFileToSvg(
  file: File,
  options?: PngTracingOptions,
): Promise<string> {
  await ensureWasm();

  const {
    binary = false,
    mode = "spline",
    hierarchical = "stacked",
    filterSpeckle = 4,
    colorPrecision = 6,
    layerDifference = 16,
    cornerThreshold = 60,
    lengthThreshold = 4.0,
    maxIterations = 10,
    spliceThreshold = 45,
    pathPrecision = 3,
  } = options ?? {};

  const bitmap = await createImageBitmap(file);
  const rawCanvas = document.createElement("canvas");
  rawCanvas.width = bitmap.width;
  rawCanvas.height = bitmap.height;
  const rawCtx = rawCanvas.getContext("2d");
  if (!rawCtx) {
    throw new Error("Could not get 2D context for PNG tracing");
  }
  rawCtx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const canvas = scaleCanvas(rawCanvas, MAX_DIMENSION);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context after scaling");
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = new Uint8Array(imageData.data.buffer);

  return to_svg(pixels, canvas.width, canvas.height, {
    binary,
    mode,
    hierarchical,
    filterSpeckle,
    colorPrecision,
    layerDifference,
    cornerThreshold,
    lengthThreshold,
    maxIterations,
    spliceThreshold,
    pathPrecision,
  });
}
