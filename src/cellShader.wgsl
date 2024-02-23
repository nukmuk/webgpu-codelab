@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(1) var<storage> cellStates: array<u32>;

struct VertexInput {
    @location(0) pos: vec2f,
    @builtin(instance_index) instance: u32,
};

struct VertexOutput {
    @builtin(position) pos: vec4f,
    @location(0) cell: vec2f,
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    let i = f32(input.instance);
    let cell = vec2f(i % grid[0], floor(i / grid[0]));
    let currentState = f32(cellStates[input.instance]);

    let cellOffset = cell / grid * 2;
    let gridPos = (input.pos*currentState + 1 ) / grid - 1 + cellOffset;

    return VertexOutput(vec4f(gridPos, 0, 1), cell);
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    let c = input.cell/grid;
    return vec4f(c.x, 1-c.y, (c.x+c.y)/10, 1)*0.8+0.1;
}