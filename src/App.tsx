import { useRef, useEffect, type SyntheticEvent } from 'react';
import GameCanvas from './GameCanvas';
import { CollisionAwareRenderBuffer } from './CollisionAwareRenderBuffer';
import { CPUCycleTimer } from './CPUCycleTimer.ts';
import { SteadyTimer } from './SteadyTimer.ts';
import { Chip8CPU } from './Chip8CPU.ts';
import { KeypadInputHandler } from './KeypadInputHandler.ts';
import { AudioPlayer } from './AudioPlayer.ts';

function App() {
    const WIDTH = 64;
    const HEIGHT = 32;
    const PIXEL_SIZE = 10;

    const gameCanvasRef = useRef<any>(null);

    // Initialise render buffer
    const renderBuffer = new CollisionAwareRenderBuffer(WIDTH, HEIGHT);
    
    // Initialise chip 8 cpu
    const chip8Cpu = new Chip8CPU();
    chip8Cpu.initRegisters();
    chip8Cpu.setOnCLSCallback(onClearDisplay);
    chip8Cpu.setOnDrawCallback(onDrawPixel);
    chip8Cpu.setOnPlayBeepCallback(onPlayBeep);
    chip8Cpu.setOnStopBeepCallback(onStopBeep);

    // Initialise audio player
    const audioPlayer = new AudioPlayer(0.1);

    // Initialise timers
    const cpuCycleTimer = new CPUCycleTimer();
    cpuCycleTimer.setTickCallback(tick);

    const steadyTimer = new SteadyTimer(60); // used for decrementing dt and st
    steadyTimer.setTickCallback(decrementTimers);

    function tick() {
        chip8Cpu.runOneCycle();
    }

    function decrementTimers(){
        chip8Cpu.decrementTimers();
    }
    
    // Callback functions
    function onClearDisplay() {
        gameCanvasRef.current?.clearCanvas();
    }

    function onDrawPixel(x:number, y:number){
        gameCanvasRef.current?.drawPixel(x, y);
    }

    function onKeyDown(event:any){
        let chip8Key = KeypadInputHandler.translatePhysicalKeyboardInputToKeypad(event);
        chip8Cpu.keyDown(chip8Key);
    }

    function onKeyUp(event:any){
        let chip8Key = KeypadInputHandler.translatePhysicalKeyboardInputToKeypad(event);
        chip8Cpu.keyUp(chip8Key);
    }

    function onPlayBeep(){
        audioPlayer.beep();
    }

    function onStopBeep(){
        audioPlayer.stop();
    }

    // file picker
    const fpRef = useRef<any>(null);
    useEffect(() => {
        console.log("Initialising App");

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        fpRef.current.addEventListener("change", function(){
            if(fpRef.current.files == null || fpRef.current.files.length == 0){
                console.error("No files found");
                return;
            }

            let file = fpRef.current.files[0];
            cpuCycleTimer.stop();
            steadyTimer.stop();
            readFileFromInputAsUint8Array(file)
                .then(uint8Array => {
                    gameCanvasRef.current?.clearCanvas();
                    chip8Cpu.initRegisters();
                    chip8Cpu.loadROM(uint8Array);
                    cpuCycleTimer.start();
                    steadyTimer.start();
                    audioPlayer.resume();
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