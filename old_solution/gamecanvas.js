class GameCanvas extends BaseGameCanvas{
    constructor(id, gridWidth, gridHeight){
        super();

        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;

        this.canvas = document.getElementById(id);

        this.canvas.width = this.gridWidth + 2;
        this.canvas.height = this.gridHeight + 2;

        this.ctx = this.canvas.getContext("2d");

        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(0, 0, this.gridWidth + 2, this.gridHeight + 2);

        this.gameScreen = this.ctx.createImageData(this.gridWidth, this.gridHeight);
    }

    drawBoundingBox(){
        for(let i = 0; i < this.gridWidth; ++i){
            this.drawPixel(i, 0);
        }
    
        for(let i = 0; i < this.gridWidth; ++i){
            this.drawPixel(i, this.gridHeight-1);
        }
    
        for(let i = 1; i < this.gridHeight - 1; ++i){
            this.drawPixel(0, i);
        }
    
        for(let i = 1; i < this.gridHeight - 1; ++i){
            this.drawPixel(this.gridWidth-1, i);
        }

        this.draw();
    }

    rgbaSize = 4;
    getRgbaForIndex(x, y){
        let red = this.getArrIndex(x, y);
        return this.gameScreen.data[red, red+1, red+2, red+3];
    }

    getArrIndex(x, y){
        return (y * (this.gridWidth * this.rgbaSize)) + (x * this.rgbaSize);
    }

    getPixelCollision(x, y){
        let idx = this.getArrIndex(x, y);
        return (this.gameScreen.data[idx] == 0 && this.gameScreen.data[idx + 3] == 255);
    }

    drawPixel(x, y){
        let collisionOccured = this.getPixelCollision(x, y);
        if(collisionOccured){
            this.setPixel(x, y, this.WHITE);
        }else{
            this.setPixel(x, y, this.BLACK);
        }
        return collisionOccured;
    }

    clearPixel(x, y){
        this.setPixel(x, y, this.WHITE);
    }

    WHITE = [255,255,255,255];
    BLACK = [0,0,0,255];
    setPixel(x, y, colourArr){
        let idx = this.getArrIndex(x, y);
        for(let i = 0; i < this.rgbaSize; ++i){
            this.gameScreen.data[idx + i] = colourArr[i];
        }
    }

    clear(){
        this.gameScreen = this.ctx.createImageData(this.gridWidth, this.gridHeight);
    }

    draw(){
        this.ctx.putImageData(this.gameScreen, 1, 1);
    }
}