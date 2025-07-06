import { useEffect } from 'react';

import { CollisionAwareRenderBuffer } from './CollisionAwareRenderBuffer';
import "./GameCanvas.css";

function GameCanvas(props: any) {

    const gridWidth:number = props.gridWidth;
    const gridHeight:number = props.gridHeight;
    const pixelSize:number = props.pixelSize;
    const renderBuffer:CollisionAwareRenderBuffer = props.renderBuffer;
    
    let canvasCtx:CanvasRenderingContext2D;

    useEffect(() => {
        let canvasBorderWidth = (gridWidth + 2) * pixelSize;
        let canvasBorderHeight = (gridHeight + 2) * pixelSize;
        let canvasRef:HTMLCanvasElement = document.getElementById("game_canvas") as HTMLCanvasElement
        canvasCtx = canvasRef.getContext("2d") as CanvasRenderingContext2D;
        canvasRef.width = canvasBorderWidth;
        canvasRef.height = canvasBorderHeight;
        canvasCtx.strokeStyle = 'lightgreen';
        canvasCtx.lineWidth = pixelSize * 2;
        canvasCtx.strokeRect(0, 0, canvasBorderWidth, canvasBorderHeight);
        drawBufferToScreen();
    });

    function drawBufferToScreen(){
        let rawBuffer = renderBuffer.getRawBuffer();
        for (let i = 0; i < rawBuffer.length; ++i){
            canvasCtx.fillStyle = rawBuffer[i] == 0 ? 'white' : 'black';
            canvasCtx.fillRect(getX(i) * pixelSize, getY(i) * pixelSize, pixelSize, pixelSize);
        }
    }

    function getX(idx:number):number{
        return (idx % gridWidth) + 1;
    }

    function getY(idx:number):number{
        return ((idx - (idx % gridWidth)) / gridWidth) + 1;
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
