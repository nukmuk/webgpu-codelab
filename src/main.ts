import cellShader from "./cellShader.wgsl?raw";
const canvas = document.querySelector("canvas");

if (!canvas) throw new Error("No canvas");

const nav = navigator as any;

if (!nav.gpu) {
  throw new Error("WebGPU not supported");
}

const adapter = await nav.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");

if (!context) throw new Error("No context");

const canvasFormat = nav.gpu.getPreferredCanvasFormat();
context.configure({
  device: device,
  format: canvasFormat,
});

const vertices = new Float32Array([
  -0.8, // triangle 1
  -0.8,
  0.8,
  -0.8,
  0.8,
  0.8,

  -0.8, // triangle 2
  -0.8,
  0.8,
  0.8,
  -0.8,
  0.8,
]);
const vertexBuffer = device.createBuffer({
  label: "cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

const vertexBufferLayout: GPUVertexBufferLayout = {
  arrayStride: 8,
  attributes: [
    {
      format: "float32x2",
      offset: 0,
      shaderLocation: 0,
    },
  ],
};

const cellShaderModule = device.createShaderModule({
  label: "cell shader",
  code: cellShader,
});

const cellPipeline = device.createRenderPipeline({
  label: "cell pipeline",
  layout: "auto",
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain",
    buffers: [vertexBufferLayout],
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain",
    targets: [
      {
        format: canvasFormat,
      },
    ],
  },
});

const encoder = device.createCommandEncoder();
const texture = context.getCurrentTexture();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: texture.createView(),
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0.8, g: 0, b: 0.8, a: 1 },
    },
  ],
});

pass.setPipeline(cellPipeline);
pass.setVertexBuffer(0, vertexBuffer);
pass.draw(vertices.length / 2);

pass.end();

device.queue.submit([encoder.finish()]);

export {};
