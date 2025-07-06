import { useRef, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { CollisionAwareRenderBuffer } from './CollisionAwareRenderBuffer';
import { ClockTimer } from './ClockTimer.ts';
import { Chip8CPU } from './Chip8CPU.ts';

function App() {
    const WIDTH = 64;
    const HEIGHT = 32;
    const PIXEL_SIZE = 10;
    const FPS = 60;

    const gameCanvasRef = useRef<any>(null);

    // Initialise render buffer
    const renderBuffer = new CollisionAwareRenderBuffer(WIDTH, HEIGHT);
    
    // Initialise chip 8 cpu
    const chip8Cpu = new Chip8CPU();
    chip8Cpu.initRegisters();
    chip8Cpu.setOnCLSCallback(onClearDisplay);
    chip8Cpu.setOnDrawCallback(onDrawPixel);

    // Initialise timer
    const clockTimer = new ClockTimer(FPS);
    clockTimer.setTickCallback(tick);

    function tick() {
        chip8Cpu.runOneCycle();
    }
    
    // Callback functions
    function onClearDisplay() {
        renderBuffer.clearBuffer();
        // gameCanvasRef.current?.drawBufferToCanvas();
        gameCanvasRef.current?.clearCanvas();
    }

    function onDrawPixel(x:number, y:number){
        // let collided = renderBuffer.setPixelWithCollisionCheck(x, y);
        // if(collided){
        //     chip8Cpu.pixelCollisionOccured();
        // }
        // gameCanvasRef.current?.drawBufferToCanvas();
        gameCanvasRef.current?.drawPixel(x, y);
    }

    // file picker
    const fpRef = useRef<any>(null);
    useEffect(() => {
        console.log("Initialising App");

        fpRef.current.addEventListener("change", function(){
            if(fpRef.current.files == null || fpRef.current.files.length == 0){
                console.error("No files found");
                return;
            }

            let file = fpRef.current.files[0];
            clockTimer.stop();
            readFileFromInputAsUint8Array(file)
                .then(uint8Array => {
                    renderBuffer.clearBuffer();
                    chip8Cpu.initRegisters();
                    chip8Cpu.loadROM(uint8Array);
                    clockTimer.start();
                })
                .catch(error => {
                    console.error('Error reading file:', error);
                });
        }, false);
    });

    function readFileFromInputAsUint8Array(file: File): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    const arrayBuffer = event.target.result as ArrayBuffer;
                    resolve(new Uint8Array(arrayBuffer));
                } else {
                    reject(new Error('Failed to read file.'));
                }
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    return (
        <>
            <GameCanvas ref={gameCanvasRef} gridWidth={WIDTH} gridHeight={HEIGHT} pixelSize={PIXEL_SIZE} renderBuffer={renderBuffer} />
            <input ref={fpRef} type="file" id="rom"/>
        </>
    )
}

export default App
