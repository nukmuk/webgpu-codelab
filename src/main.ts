const canvas = document.querySelector("canvas");

const nav = navigator as any;

if (!nav.gpu) {
  throw new Error("WebGPU not supported");
}

const adapter = await nav.requestAdapter();
const device = await adapter.requestDevice();
export {};
