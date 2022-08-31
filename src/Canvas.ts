export class Canvas {
    ctx: CanvasRenderingContext2D | null;
    width: number;
    height: number;
    gridSize: {x: number, y: number} = {
        x: 0,
        y: 0
    }
    frameCount: number = 0;

    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.ctx = canvas.getContext("2d");
        this.width = width;
        this.height = height;

        this.gridSize = {
            x: canvas.width / width,
            y: canvas.height / height
        }
    }
}