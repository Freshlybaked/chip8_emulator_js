class RectGameCanvas extends BaseGameCanvas{
    constructor(id, gridWidth, gridHeight, pixelSize){
        super();

        this.pixelSize = pixelSize;

        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;

        this.canvas = document.getElementById(id);

        this.canvas.width = (this.gridWidth * this.pixelSize) + 2;
        this.canvas.height = (this.gridHeight * this.pixelSize)+ 2;

        this.ctx = this.canvas.getContext("2d");

        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(0, 0, (this.gridWidth * this.pixelSize) + 2, (this.gridHeight * this.pixelSize) + 2);

        this.buffer = [this.gridWidth * this.gridHeight].fill(0);
    }

    drawPixel(x, y){
        let collisionOccured = this.getPixelCollision(x, y);
        this.buffer[this.getIdx(x, y)] = collisionOccured ? 0 : 1;
        this.setPixel(x, y, collisionOccured ? 'white' : 'black');
        return collisionOccured;
    }

    clear(){
        this.buffer.fill(0);
        this.redrawEntireBuffer();
    }

    draw(){
        console.log("not implemented");
    }

    setPixel(x, y, colour){
        // console.log("setting pixel at : " + x + ", " + y + " " +colour);
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
    }

    redrawEntireBuffer(){
        for (let i = 0; i < this.buffer.length; ++i){
            let x = this.getX(i);
            let y = this.getY(i);
            this.setPixel(x, y, this.buffer[i] == 1 ? 'black' : 'white');
        }
    }
    
    getX(idx){
        return idx % this.gridWidth;
    }

    getY(idx){
        return (idx - (idx % this.gridWidth)) / this.gridWidth;
    }

    getIdx(x, y){
        return (this.gridWidth * y) + x;
    }

    getPixelCollision(x, y){
        return this.buffer[this.getIdx(x, y)] == 1;
    }
}