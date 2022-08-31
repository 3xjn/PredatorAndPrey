import { Canvas } from "./Canvas";

enum CellType {
    Empty,
    Prey,
    Predator
}
class Cell {
    type: CellType;
    x: number;
    y: number;
    health: number;
    age: number = 0;
    neighbors: Cell[] = [];

    constructor(type: CellType, x: number, y: number) {
        this.type = type;
        this.x = x;
        this.y = y;
    }

    draw(canvas: Canvas) {
        if (!canvas || this.type === CellType.Empty) return;
        const ctx = canvas.ctx;
        const gridSizeX = canvas.gridSize.x;
        const gridSizeY = canvas.gridSize.y;

        ctx.fillStyle = this.type === CellType.Empty ? 'black': this.type === CellType.Prey ? `rgb(0, ${100 + this.age * 10}, 0)` : `rgb(${100 + this.age * 10}, 0, 0)`
        ctx.fillRect(this.x * gridSizeX, this.y * gridSizeY, gridSizeX, gridSizeY);

        console.log(`#${canvas.frameCount} (${this.x}, ${this.y}) ${this.type}`)
    }

    update() {
        if (this.type === CellType.Empty) return;
        
        switch(this.type) {
            case CellType.Prey: {
                const emptyNeighbor = this.findNeighbor(CellType.Empty);
                if (!emptyNeighbor) break;

                this.move(emptyNeighbor);
            }
        }
    }

    move(cell: Cell) {
        cell.type = this.type;
        cell.age = this.age;
        cell.health = this.health;

        this.type = CellType.Empty;
    }

    findNeighbor(type: CellType): Cell {
        const neighbors = this.neighbors;
        const randOffset = Math.floor(Math.random() * neighbors.length);
        
        for (let i = 0; i < neighbors.length; i++) {
            const index = (i + randOffset) % neighbors.length;
            if (neighbors[index].type === type) {
                return neighbors[index];
            }
        }

        return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
}

export { Cell, CellType }