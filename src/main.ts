import './style.css'
import { Canvas } from './Canvas';
import { Cell, CellType } from './Cell';

const frameRate = 1;
const width = 100;
const height = 100;

const canvasElement = document.getElementsByClassName('canvas')[0] as HTMLCanvasElement;

const canvas = new Canvas(canvasElement, width, height);

let cells: Cell[][] = [];

function mapCells(fn: (cell: Cell) => void): void {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[x].length; y++) {
            fn(cells[x][y]);
        }
    }
}

for (let x = 0; x < canvas.width; x++) {
    cells[x] = [];
    for (let y = 0; y < canvas.height; y++) {
        cells[x][y] = new Cell(CellType.Empty, x, y);
    }
}

mapCells(cell => {
    cell.neighbors = [];
    for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
            if (x === 0 && y === 0) continue;

            let neighborX = cell.x + x;
            let neighborY = cell.y + y;

            if (neighborX < 0) neighborX = canvas.width - 1;
            if (neighborY < 0) neighborY = canvas.height - 1;
            if (neighborX >= canvas.width) neighborX = 0;
            if (neighborY >= canvas.height) neighborY = 0;

            cell.neighbors.push(cells[neighborX][neighborY]);
        }
    }
});

mapCells((cell: Cell) => {
    //cell.type = Math.random() > 0.9 ? CellType.Prey : CellType.Empty; 
    if (cell.x == 50 && cell.y == 50) {
        cell.type = CellType.Prey;
    }
})

var frameCount = 0;
var timeElapsed = Date.now()

function animate() {
    if (!canvas.ctx) return;
    if (Date.now() - timeElapsed <= 1000 / frameRate) {
        requestAnimationFrame(animate);
        return;
    };

    // if all cells are empty, stop
    if (cells.every(row => row.every(cell => cell.type === CellType.Empty))) {
        console.log('all cells are empty');
        return;
    }

    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw cells and update
    mapCells(cell => {
        cell.draw(canvas);

        // if frameCount is 0, don't update
        if (frameCount === 0) return;
        
        cell.update();
    });

    canvas.frameCount = ++frameCount;
    timeElapsed = Date.now();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);