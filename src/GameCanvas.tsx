import { useImperativeHandle, useRef, useEffect } from 'react';

import { CollisionAwareRenderBuffer } from './CollisionAwareRenderBuffer';
import "./GameCanvas.css";

function GameCanvas({ref, ...props}) {
    useImperativeHandle(ref, () => {
        return {
            drawBufferToCanvas,
            drawPixel,
            clearCanvas
        };
    }, []);

    const gridWidth:number = props.gridWidth;
    const gridHeight:number = props.gridHeight;
    const pixelSize:number = props.pixelSize;
    const renderBuffer:CollisionAwareRenderBuffer = props.renderBuffer;

    const canvasBorderWidth = (gridWidth + 2) * pixelSize;
    const canvasBorderHeight = (gridHeight + 2) * pixelSize;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    let canvasCtx:CanvasRenderingContext2D;
    
    useEffect(() => {
        console.log("Initialising GameCanvas");

        let canvas = canvasRef.current;
        if(canvas == null){
            console.error("Unable to get reference to canvas");
            return;
        }

        canvas.width = canvasBorderWidth;
        canvas.height = canvasBorderHeight;
        canvasCtx = canvas.getContext("2d") as CanvasRenderingContext2D;
        
        canvasCtx.strokeStyle = 'lightgreen';
        canvasCtx.lineWidth = pixelSize * 2;
        canvasCtx.strokeRect(0, 0, canvasBorderWidth, canvasBorderHeight);
        
        drawBufferToCanvas();
    });

    function drawPixel(x:number, y:number){
        let collided = renderBuffer.setPixelWithCollisionCheck(x, y);
        canvasCtx.fillStyle = collided ? 'white' : 'black';
        canvasCtx.fillRect((x+1) * pixelSize, (y+1) * pixelSize, pixelSize, pixelSize);
    }

    function drawBufferToCanvas(){
        clearCanvas();
        let rawBuffer = renderBuffer.getRawBuffer();
        for (let i = 0; i < rawBuffer.length; ++i){
            canvasCtx.fillStyle = rawBuffer[i] == 0 ? 'white' : 'black';
            canvasCtx.fillRect(getX(i) * pixelSize, getY(i) * pixelSize, pixelSize, pixelSize);
        }
    }

    function clearCanvas(){
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillRect(1 * pixelSize, 1 * pixelSize, pixelSize * gridWidth, pixelSize * gridHeight);
    }

    // function drawPixelToCanvas(x:number, y:number){

    // }

    function getX(idx:number):number{
        return (idx % gridWidth) + 1;
    }

    function getY(idx:number):number{
        return ((idx - (idx % gridWidth)) / gridWidth) + 1;
    }

    return (
        <>
            <div>
                <canvas ref={canvasRef} id="game_canvas"></canvas>
            </div>
        </>
    )
}

export default GameCanvas
