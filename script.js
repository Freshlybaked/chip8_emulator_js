var opcode = null;
var memory = [4096];
var V = [16]; // 16 general purpose 8 bit registers
var I = null; // single 16 bit register
var pc = null; // program counter
var stack = [16];
var sp = null;
var key = [16];
var dt;
var st;

var gamecanvas;
const width = 64;
const height = 32;
const pixelSize = 10;

var waitForKeyPress = false;
var storeKeyPressIntoRegister = -1;

var fontset = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

window.onload = function() {

    gamecanvas = new RectGameCanvas("game_canvas", width, height, pixelSize);
    // gamecanvas = new GameCanvas("game_canvas", width, height);
    // gamecanvas.drawBoundingBox();

    initialiseRegisters();
    initialiseKeyboardEventHandlers();

    var fp = document.getElementById("rom");
    fp.addEventListener("change", function(event) {
        if(fp.files == null || fp.files.length == 0){
            return;
        }

        let file = fp.files[0];
        let reader = new FileReader();
        reader.onload = function(event){
            let fileContents = event.target.result;
            let romData = new Uint8Array(fileContents);

            // load file contents into working memory
            for(let i = 0; i < romData.length; ++i){
                memory[pc + i] = romData[i];
            }

            beginEmulationLoop();
        }

        reader.readAsArrayBuffer(file);
    }, false);

};

function initialiseRegisters(){
    pc = 0x200;
    opcode = 0;
    I = 0;
    sp = 0;
    
    // fonts take up memory 0 to max 512 in memory
    for(let i = 0; i < fontset.length; ++i){
        memory[i] = fontset[i];
    }
}

function initialiseKeyboardEventHandlers(){
    window.addEventListener('keydown', doKeyDown);
    window.addEventListener('keyup', doKeyUp);
}

function beginEmulationLoop(){
    // window.setInterval(emulateOneCycle, 0);
    // window.requestAnimationFrame(emulateOneCycle);

    let dt = 0;
    for(let i = 0; i < 100000; ++i){
    }
}

var skipPCIncrement = false;
var drawFlag = false;
function emulateOneCycle(step){
    skipPCIncrement = false;
    // drawFlag = false;

    opcode = (memory[pc] << 8 | memory[pc+1]).toString(16);

    if(waitForKeyPress){
        return;
    }
    
    executeInstruction();

    // if(drawFlag)
    //     gamecanvas.draw();

    if(!skipPCIncrement)
        pc += 2;

    tickDownTimers();

    // window.requestAnimationFrame(emulateOneCycle);
}

var currKey = -1;
function doKeyDown(e){
    let key = e.keyCode;
    switch(key){
        case 49: currKey = 0x1; break; //1
        case 50: currKey = 0x2; break; //2
        case 51: currKey = 0x3; break; //3
        case 51: currKey = 0xc; break; //C
        case 81: currKey = 0x4; break; //4
        case 87: currKey = 0x5; break; //5
        case 69: currKey = 0x6; break; //6
        case 82: currKey = 0xd; break; //D
        case 65: currKey = 0x7; break; //7
        case 83: currKey = 0x8; break; //8
        case 68: currKey = 0x9; break; //9
        case 70: currKey = 0xe; break; //E
        case 90: currKey = 0xa; break; //A
        case 88: currKey = 0x0; break; //0
        case 67: currKey = 0xb; break; //B
        case 86: currKey = 0xf; break; //F
        default: currKey = -1; break;
    }

    if(storeKeyPressIntoRegister > -1){
        V[storeKeyPressIntoRegister] = currKey;
        storeKeyPressIntoRegister = -1;
        currKey = -1;
    }

    waitForKeyPress = false;
}

function doKeyUp(e){
    currKey = -1;
}

function tickDownTimers(){
    if(dt > 0)
        dt -= 1;

    if(st > 0){
        // console.log("Playing sound!");
        st -= 1;
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

function executeInstruction(){
    if(opcode.startsWith("1")){
        let destAddr = parseInt(opcode,16) & 0x0FFF;
        pc = destAddr;
        skipPCIncrement = true;        
    }else if(opcode.startsWith("2")){
        stack.push(pc + 2);

        let subroutineToCall = parseInt(opcode, 16) & 0x0FFF;
        pc = subroutineToCall;

        skipPCIncrement = true;
    }else if(opcode.startsWith("3")){
        let register = parseInt(opcode, 16) >> 8 & 0x000F;
        let val = parseInt(opcode, 16) & 0x00FF;
        if(V[register] == val){
            pc += 2;
        }
    }else if(opcode.startsWith("4")){
        let register = parseInt(opcode, 16) >> 8 & 0x000F;
        let val = parseInt(opcode, 16) & 0x00FF;
        if(V[register] != val){
            pc += 2;
        }
    }else if(opcode.startsWith("5")){
        let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
        let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
        if(V[registerX] == V[registerY]){
            pc += 2;
        }
    }else if(opcode.startsWith("6")){
        let register = parseInt(opcode, 16) >> 8 & 0x000F;
        let val = parseInt(opcode, 16) & 0x00FF;
        V[register] = val;
    }else if(opcode.startsWith("7")){
        let registerToAdd = parseInt(opcode, 16) >> 8 & 0x000F;
        let addVal = parseInt(opcode, 16) & 0x00FF;
        let result = (V[registerToAdd] + addVal) % 256;
        V[registerToAdd] = result;
    }else if(opcode.startsWith("8")){
        if(opcode.endsWith("0")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[registerX] = V[registerY];
        }else if(opcode.endsWith("1")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[registerX] = V[registerX] | V[registerY];
        }else if(opcode.endsWith("2")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[registerX] = V[registerX] & V[registerY];
        }else if(opcode.endsWith("3")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[registerX] = V[registerX] ^ V[registerY];
        }else if(opcode.endsWith("4")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            let sum = V[registerX] + V[registerY];
            V[0xF] = sum > 255 ? 1 : 0;;
            V[registerX] = sum & 0x00FF;
        }else if(opcode.endsWith("5")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[0xF] = V[registerX] > V[registerY] ? 1 : 0;;

            let result = V[registerX] - V[registerY];
            if(result < 0){
                result = (255 - Math.abs(result)) + 1;
            }
            V[registerX] = result;
        }else if(opcode.endsWith("6")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[0xF] = (V[registerX] & 0x01) == 1 ? 1 : 0;

            let shifted = V[registerX] >> 1;
            V[registerX] = shifted;
        }else if(opcode.endsWith("7")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
            V[0xF] = V[registerY] > V[registerX] ? 1 : 0;

            let result = V[registerY] - V[registerX];
            V[registerX] = result;
        }else if(opcode.endsWith("e")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            V[0xF] = V[registerX] >> 7 == 1 ? 1 : 0;;

            V[registerX] = (V[registerX] << 1) % 256;
        }else{
            console.log("no opcode implementation found for " + opcode);
        }
    }else if(opcode.startsWith("9")){
        let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
        let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
        if(V[registerX] != V[registerY]){
            pc += 2;
        }
    }else if(opcode.startsWith("a")){
        let opcodeParam = parseInt(opcode,16) & 0x0FFF;
        I = opcodeParam;
    }else if(opcode.startsWith("c")){
        let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
        let rand = getRandomInt(255);

        let kk = parseInt(opcode, 16) & 0x00FF;
        let res = rand & kk;
        V[registerX] = res;
    }else if(opcode.startsWith("d")){
        DRAW_SPRITE();
        // drawFlag = true;
    }else if(opcode.length == 4 && opcode.startsWith("e")){
        if(opcode.endsWith("9e")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            if(currKey == V[registerX]){
                pc += 2;
            }
        }else if(opcode.endsWith("a1")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            if(currKey != V[registerX]){
                pc += 2;
            }
        }
    }else if(opcode.startsWith("f")){
        if(opcode.endsWith("0a")){
            waitForKeyPress = true;
            storeKeyPressIntoRegister = parseInt(opcode, 16) >> 8 & 0x000F;
        }else if(opcode.endsWith("07")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            V[registerX] = dt;
        }else if(opcode.endsWith("15")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            dt = V[registerX];
        }else if(opcode.endsWith("18")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            st = V[registerX];
        }else if(opcode.endsWith("1e")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            I += V[registerX];
        }else if(opcode.endsWith("29")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
            I = V[registerX] * 5;
        }else if(opcode.endsWith("33")){
            let registerX = parseInt(opcode, 16) >> 8 & 0x000F;

            let regXVal = V[registerX];
            let hundreds = parseInt(regXVal / 100);
            let tens = parseInt((regXVal / 10) % 10);
            let ones = parseInt(regXVal % 10);

            memory[I] = parseInt(hundreds);
            memory[I+1] = parseInt(tens);
            memory[I+2] = parseInt(ones);
        }else if(opcode.endsWith("55")){
            let registerMax = parseInt(opcode, 16) >> 8 & 0x000F;
            for(let i = 0; i <= registerMax; ++i){
                memory[I + i] = V[i];
            }
        }else if(opcode.endsWith("65")){
            let registerMax = parseInt(opcode, 16) >> 8 & 0x000F;
            for(let i = 0; i <= registerMax; ++i){
                V[i] = memory[I + i];
            }
        }else{
            console.log("no opcode implementation found for " + opcode);
        }
    }else if(opcode === "e0"){
        gamecanvas.clear();
        drawFlag = true;
    }else if(opcode === "ee"){
        pc = stack.pop();
        skipPCIncrement = true;
    }else{
        console.log("No implementation for : " + opcode);
    }
}

// function DRAW_SPRITE(){
//     gamecanvas.drawPixel(10, 10);
// }

function DRAW_SPRITE(){
    // D-Vx-Vy-n
    // displays n-byte sprite at coordinates stored in registers Vx and Vy
    let registerX = parseInt(opcode, 16) >> 8 & 0x000F;
    let registerY = parseInt(opcode, 16) >> 4 & 0x000F;
    let nBytes = parseInt(opcode, 16) & 0x000F;

    for(let j = 0; j < nBytes; ++j){
        let sprite = memory[I + j];

        for(let i = 0; i < 8; ++i){
            let posX = V[registerX] + i;
            let posY = V[registerY] + j;

            if((sprite & (0x80 >> i)) != 0){
                let collided = gamecanvas.drawPixel(posX, posY);
                V[0xF] = collided ? 1 : 0;
            }
        }
    }
}