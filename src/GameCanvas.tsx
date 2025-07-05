import { useEffect } from 'react';

import "./GameCanvas.css";

function GameCanvas(props: any) {

    const gridWidth:number = props.gridWidth;
    const gridHeight:number = props.gridHeight;
    const pixelSize:number = props.pixelSize;

    let canvasCtx:CanvasRenderingContext2D;

    let buffer:number[] = [gridWidth * gridHeight].fill(0);

    useEffect(() => {
        console.log("GameCanvas mounted");
        let canvasRef:HTMLCanvasElement = document.getElementById("game_canvas") as HTMLCanvasElement
        canvasCtx = canvasRef.getContext("2d") as CanvasRenderingContext2D;
        canvasCtx.strokeStyle = 'black';
        canvasCtx.strokeRect(0, 0, (gridWidth * pixelSize) + 2, (gridHeight * pixelSize) + 2);
    });

    function drawPixel(x:number, y:number):boolean{
        let collisionOccured = getPixelCollision(x, y);
        buffer[getIdx(x, y)] = collisionOccured ? 0 : 1;
        setPixel(x, y, collisionOccured ? 'white' : 'black');
        return collisionOccured;
    }

    function clear(){
        buffer.fill(0);
        redrawEntireBuffer();
    }

    function setPixel(x:number, y:number, colour:string){
        // console.log("setting pixel at : " + x + ", " + y + " " +colour);
        canvasCtx.fillStyle = colour;
        canvasCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }

    function getPixelCollision(x:number, y:number):boolean{
        return buffer[getIdx(x, y)] == 1;
    }

    function redrawEntireBuffer(){
        for (let i = 0; i < buffer.length; ++i){
            let x = getX(i);
            let y = getY(i);
            setPixel(x, y, buffer[i] == 1 ? 'black' : 'white');
        }
    }

    // Returns the index in the buffer for the pixel at (x, y)
    function getIdx(x:number, y:number):number{
        return (gridWidth * y) + x;
    }

    function getX(idx:number):number{
        return idx % gridWidth;
    }

    function getY(idx:number):number{
        return (idx - (idx % gridWidth)) / gridWidth;
    }

    return (
        <>
        <div>
            <canvas id="game_canvas"></canvas>
        </div>
        </>
    )
}

export default GameCanvas
