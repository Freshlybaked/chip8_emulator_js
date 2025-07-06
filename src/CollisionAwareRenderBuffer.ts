export class CollisionAwareRenderBuffer{
    private buffer:Uint8Array;
    readonly width:number;
    readonly height:number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.buffer = new Uint8Array(width * height);
    }

    setPixelWithCollisionCheck(x:number, y:number):boolean{
        let collisionOccured = this.getPixelCollision(x, y);

        // If a collision occured, set the value in the buffer to 0, else 1
        this.setPixel(x, y, collisionOccured ? 0 : 1);
        
        return collisionOccured;
    }

    setPixel(x:number, y:number, val:number){
        this.buffer[this.getIdx(x, y)] = val;
    }

    clearBuffer(){
        this.buffer.fill(0);
    }

    getRawBuffer():Uint8Array {
        return this.buffer;
    }

    // Returns the index in the buffer for the pixel at (x, y)
    private getIdx(x:number, y:number):number{
        return (this.width * y) + x;
    }

    // Checks if the current index already has a value
    private getPixelCollision(x:number, y:number):boolean{
        return this.buffer[this.getIdx(x, y)] == 1;
    }
}