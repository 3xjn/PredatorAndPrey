import './style.css'
import { Gene } from './Gene';

const frameRate = 120;

const Percentages = {
    "Predator": 0.01,
    "Prey": 0.01,
    "Empty": 0.0
}

const columns = 100;

const predatorStartingHealth = 10;
const preyStartingHealth = 40;

const canvas = document.getElementsByClassName('canvas')[0] as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

enum CellType {
    Empty,
    Predator,
    Prey,
}

let cells: Cell[][] = [];
const gridSize = canvas.width / columns;

// create a function to map each individual cell with a function
function mapCells(fn: (cell: Cell) => void): void {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[x].length; y++) {
            fn(cells[x][y]);
        }
    }
}

function constrain(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
}

const geneStarter = new Gene({
    pointFunds: 6,
    survivalProbability: 1,
    predatorDeathThreshold: 5,
    reproduceThreshold: 5,
    maxHealth: 5,
    maxAge: 4,
    twinLikelyhood: 0.01
});

class Cell {
    type: CellType;
    x: number;
    y: number;
    health: number;
    age: number;
    genes: Gene;
    neighbors: Cell[];

    constructor(type: CellType, x: number, y: number) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.health = type === CellType.Prey ? preyStartingHealth : (type === CellType.Predator ? predatorStartingHealth : 0);
        this.age = 0;
        //this.genes = new Gene(0.25, predatorDieThreshold, preyReproduceThreshold, 2, 10, 0.1);
        this.genes = geneStarter.clone();
    }

    // predator light red, prey light green, empty black
    public draw() {
        if (!ctx) return;

        ctx.fillStyle = this.type === CellType.Empty ? 'black': this.type === CellType.Prey ? `rgb(0, ${100 + this.age * 10}, 0)` : `rgb(${100 + this.age * 10}, 0, 0)`
        ctx.fillRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    }

    public move(cell: Cell) {
        cell.type = this.type;
        cell.genes = this.genes.clone();
        cell.age = this.age;
        cell.health = this.health;

        this.type = CellType.Empty;
    }

    public reproduce(cell: Cell): void {
        if (!cell) return;

        cell.type = this.type;
        cell.genes = this.genes.clone();
        cell.age = this.age;
        cell.health = this.health;

        this.genes.mutate();
        this.age = 0;
        this.health = this.type === CellType.Prey ? preyStartingHealth : this.type === CellType.Predator ? predatorStartingHealth : 0;
    }

    public findNeighbor(type: CellType): Cell {
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

    public update(): void {
        // if prey, move to empty cell, if no empty cell, move to random neighbor
        // if predator, move to prey cell, if no prey cell, move to random neighbor
        if (this.type === CellType.Empty) return;

        let moveCell!: Cell;
        
        switch (this.type) {
            case CellType.Prey: {
                moveCell = this.findNeighbor(CellType.Empty);
            }

            case CellType.Predator: {
                moveCell = this.findNeighbor(CellType.Prey);
            }
        }

        switch (this.type) {
            case CellType.Predator: {
                if (this.health <= 1) {
                    this.type = CellType.Empty;
                }

                if (moveCell.type === CellType.Prey) {
                    this.reproduce(moveCell);

                    if (Math.random() < this.genes.twinLikelyhood.value) {
                        // if empty cell, then reproduce
                        let emptyCell = moveCell.findNeighbor(CellType.Empty);
                        if (emptyCell && emptyCell.type === CellType.Empty) {
                            this.reproduce(emptyCell);
                        }
                    }
                }

                break
            }

            case CellType.Prey: {
                if (this.health >= this.genes.reproduceThreshold.value) {
                    // move to random neighbor
                    // moveCell.type = CellType.Prey;
                    // moveCell.health = 1;

                    // this.type = CellType.Empty
                    // this.hunger = 1;

                    // set random empty neighbor to prey
                    const emptyNeighbor = this.findNeighbor(CellType.Empty)
                    
                    // if (emptyNeighbor) {
                    //     emptyNeighbor.type = CellType.Prey;
                    //     emptyNeighbor.health = 1;
                    // }

                    this.reproduce(emptyNeighbor);
                    this.health = 1

                    if (Math.random() < this.genes.twinLikelyhood.value) {
                        // remove empty neighbor from neighbors
                        const emptyNeighbor = this.findNeighbor(CellType.Empty);
                        if (!emptyNeighbor) return;

                        this.reproduce(emptyNeighbor);
                    }
                }

                break;
            }
        }

        switch (this.type) {
            case CellType.Prey: {
                this.health = constrain(this.health + 1, 0, this.genes.maxHealth.value);
                break;
            }

            case CellType.Predator: {
                this.health -= 1;
                break;
            }
        }

        // if survivalProbability is 0, then test = 10%, if survivalProbability is 1, then test = 5%
        if (Math.random() < (this.genes.survivalProbability.value === 0 ? 0.1 : 0.05)
             || this.age > this.genes.maxAge.value) {
            this.type = CellType.Empty;
        }

        this.age = this.age + 1;
    }
}

// create cells

for (let x = 0; x < columns; x++) {
    cells[x] = [];
    for (let y = 0; y < columns; y++) {
        cells[x][y] = new Cell(CellType.Empty, x, y);
    }
}

// designate cells based on percentages
// each type have a percentage of the total

const totalCells = columns * columns;
const predatorCells = Math.floor(totalCells * Percentages.Predator);
const preyCells = Math.floor(totalCells * Percentages.Prey);

console.log(`total cells: ${totalCells}`);
console.log(`predator cells: ${predatorCells}`);
console.log(`prey cells: ${preyCells}`);

for (let predator = 0; predator < predatorCells; predator++) {
    var randomCell;

    // repeat until cell is empty
    do {
        randomCell = cells[Math.floor(Math.random() * cells.length)][Math.floor(Math.random() * cells.length)];
    } while (randomCell.type !== CellType.Empty);

    cells[randomCell.x][randomCell.y] = new Cell(CellType.Predator, randomCell.x, randomCell.y);
}

for (let prey = 0; prey < preyCells; prey++) {
    var randomCell;

    // repeat until cell is empty
    do {
        randomCell = cells[Math.floor(Math.random() * cells.length)][Math.floor(Math.random() * cells.length)];
    } while (randomCell.type !== CellType.Empty);

    cells[randomCell.x][randomCell.y] = new Cell(CellType.Prey, randomCell.x, randomCell.y);
}

// assign neighbors, neighbors are cells that are adjacent to the cell
// they can also the cell on the other side of the grid, if it's a cell on the edge

mapCells(cell => {
    cell.neighbors = [];
    for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
            if (x === 0 && y === 0) continue;

            let neighborX = cell.x + x;
            let neighborY = cell.y + y;

            if (neighborX < 0) neighborX = columns - 1;
            if (neighborY < 0) neighborY = columns - 1;
            if (neighborX >= columns) neighborX = 0;
            if (neighborY >= columns) neighborY = 0;

            cell.neighbors.push(cells[neighborX][neighborY]);
        }
    }
});

var frameCount = 0;
var timeElapsed = Date.now()

function animate() {
    if (!ctx) return;
    if (Date.now() - timeElapsed <= 1000 / frameRate) {
        requestAnimationFrame(animate);
        return;
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // if all cells are empty, stop
    if (cells.every(row => row.every(cell => cell.type === CellType.Empty))) {
        console.log('all cells are empty');
        return;
    }

    // draw cells and update
    mapCells(cell => {
        cell.draw();
        
        // if frameCount is 0, don't update
        if (frameCount === 0) return;

        cell.update();
        
    });
    
    

    // display frame count in top left corner
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`frame: ${frameCount}`, 10, 10);

    // display the average of each gene in the top right corner
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    const avg = new Gene()
    var totalCells = 0;

    mapCells(cell => {
        if (cell.type === CellType.Empty) return;

        avg.survivalProbability.value += cell.genes.survivalProbability.value;
        avg.predatorDeathThreshold.value += cell.genes.predatorDeathThreshold.value;
        avg.reproduceThreshold.value += cell.genes.reproduceThreshold.value;
        avg.maxHealth.value += cell.genes.maxHealth.value;
        avg.maxAge.value += cell.genes.maxAge.value;
        avg.twinLikelyhood.value += cell.genes.twinLikelyhood.value;

        totalCells++;
    });

    avg.survivalProbability.value /= totalCells;
    avg.predatorDeathThreshold.value /= totalCells;
    avg.reproduceThreshold.value /= totalCells;
    avg.maxHealth.value /= totalCells;
    avg.maxAge.value /= totalCells;
    avg.twinLikelyhood.value /= totalCells;

    ctx.fillText(`survivalProbability: ${Math.round(avg.survivalProbability.value * 100) / 100}`, canvas.width - 10, 10);
    ctx.fillText(`predatorDeathThreshold: ${Math.round(avg.predatorDeathThreshold.value * 100) / 100}`, canvas.width - 10, 30);
    ctx.fillText(`reproduceThreshold: ${Math.round(avg.reproduceThreshold.value * 100) / 100}`, canvas.width - 10, 50);
    ctx.fillText(`maxHealth: ${Math.round(avg.maxHealth.value * 100) / 100}`, canvas.width - 10, 70);
    ctx.fillText(`maxAge: ${Math.round(avg.maxAge.value * 100) / 100}`, canvas.width - 10, 90);
    ctx.fillText(`twinLikelyhood: ${Math.round(avg.twinLikelyhood.value * 100) / 100}`, canvas.width - 10, 110);
    ctx.fillText(`predcount: ${cells.map(c => c.filter(c => c.type === CellType.Predator).length).reduce((a, b) => a + b)}`, canvas.width - 10, 130);

    frameCount++;
    timeElapsed = Date.now();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);