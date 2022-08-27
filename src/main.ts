import './style.css'
import { Gene } from './Gene';

const frameRate = 60;

const Percentages = {
    "Predator": 0.5,
    "Prey": 0.1,
    "Empty": 0.0
}

const columns = 100;

const predatorStartingHealth = 20;
const preyStartingHealth = 40;

const canvas = document.getElementsByClassName('canvas')[0] as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

enum CellType {
    Empty,
    Predator,
    Prey,
}

const cells: Cell[][] = [];
const gridSize = canvas.width / columns;

// create a function to map each individual cell with a function
function mapCells(fn: (cell: Cell) => void) {
    for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
            fn(cells[y][x]);
        }
    }
}

function constrain(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
}

const geneStarter = new Gene({
    pointFunds: 6,
    survivalProbability: 1,
    predatorDeathThreshold: 1,
    reproduceThreshold: 2,
    maxHealth: 4,
    maxAge: 4,
    twinLikelyhood: 0.5
});

class Cell {
    public type: CellType;
    public x: number;
    public y: number;
    public health: number;
    public age: number;
    public neighbors?: Cell[];
    public genes: Gene;

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
        
        //ctx.fillStyle = this.type === CellType.Empty ? 'black' : this.type === CellType.Prey ? `rgb(0, ${100 + this.hunger * 10}, 0)` : `rgb(${100 + this.hunger * 10}, 0, 0)`
        ctx.fillStyle = this.type === CellType.Empty ? 'black' : 'white'//: this.type === CellType.Prey ? `rgb(0, ${100 + this.age * 10}, 0)` : `rgb(${100 + this.age * 10}, 0, 0)`
        ctx.fillRect(this.x * gridSize, this.y * gridSize, gridSize, gridSize);
    }

    public reproduce(cell: Cell) {
        if (!cell) return;

        cell.type = this.type;
        cell.genes = this.genes.clone();
        cell.age = this.age;
        cell.health = this.health;

        this.genes.mutate();
        this.age = 0;
        this.health = this.type === CellType.Prey ? preyStartingHealth : this.type === CellType.Predator ? predatorStartingHealth : 0;

        //console.log(`(${this. x}, ${this.y}) reproduced (${cell.x}, ${cell.y})`);
        //console.log(`${cell.genes.deathProbability} ${cell.genes.predatorDeathThreshold} ${cell.genes.reproduceThreshold} ${cell.genes.maxHealth} ${cell.genes.maxAge}`);
    }

    public update() {
        // if prey, move to empty cell, if no empty cell, move to random neighbor
        // if predator, move to prey cell, if no prey cell, move to random neighbor

        if (this.type === CellType.Empty) return;

        var moveCell!: Cell;

        function findNeighbor(cell: Cell, type: CellType) {
            for (let i = 0; i < cell.neighbors!.length; i++) {
                if (cell.neighbors![i].type === type) {
                    return cell.neighbors![i];
                }
            }

            return cell.neighbors![Math.floor(Math.random() * cell.neighbors!.length)];
        }
        
        switch (this.type) {
            case CellType.Prey: {
                moveCell = findNeighbor(this, CellType.Empty);
            }

            case CellType.Predator: {
                moveCell = findNeighbor(this, CellType.Prey);
            }
        }

        switch (this.type) {
            case CellType.Predator: {
                if (this.health <= 1) {
                    this.type = CellType.Empty;
                    this.health = 0;
                }

                if (moveCell.type === CellType.Prey) {
                    this.reproduce(moveCell);

                    if (Math.random() < this.genes.twinLikelyhood.value) {
                        // if empty cell, then reproduce
                        let emptyCell = findNeighbor(moveCell, CellType.Empty);
                        if (emptyCell && emptyCell.type === CellType.Empty) {
                            emptyCell.reproduce(this);
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
                    const emptyNeighbors = this.neighbors!.filter(n => n.type === CellType.Empty);
                    const emptyNeighbor = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
                    
                    // if (emptyNeighbor) {
                    //     emptyNeighbor.type = CellType.Prey;
                    //     emptyNeighbor.health = 1;
                    // }

                    this.reproduce(emptyNeighbor);

                    // if (Math.random() < this.genes.twinLikelyhood) {
                    //     // remove empty neighbor from neighbors
                    //     emptyNeighbors.splice(emptyNeighbors.indexOf(emptyNeighbor), 1);
                    //     const emptyNeighbor2 = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
                    //     this.reproduce(emptyNeighbor2);
                    // }
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
        if (Math.random() < ((0 == this.genes.survivalProbability.value) ? 0.1 : 0.05)
             || this.age > this.genes.maxAge.value) {
            this.type = CellType.Empty;
            this.health = 0;
        }

        this.age++;
    }
}

// create cells

for (let y = 0; y < columns; y++) {
    cells[y] = [];
    for (let x = 0; x < columns; x++) {
        cells[y][x] = new Cell(CellType.Empty, x, y);
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

            cell.neighbors.push(cells[neighborY][neighborX]);
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

    frameCount++;
    timeElapsed = Date.now();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);