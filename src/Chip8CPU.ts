export class Chip8CPU{

    public opcode:number = 0; // Current opcode to be decoded
    public memory:Uint8Array = new Uint8Array(4096); // 4KB Addressable RAM
    public V:Uint8Array = new Uint8Array(16); // 16 general purpose 8 bit registers
    public stack:Uint16Array = new Uint16Array(16); // Stack is array of 16 16-bit values
    public I:number = 0; // single 16 bit register
    public pc:number = 0; // program counter
    public sp:number = 0; // stack pointer
    public dt:number = 0; // delay timer, counts down to 0
    public st:number = 0; // sound timer, counts down to 0

    public key:Uint8Array = new Uint8Array(16); // represents keypress for 16 key keyboard

    // values for displaying 0-9, A-F
    private fontset:Uint8Array = new Uint8Array([
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
    ]);

    private instructionTable:Array<() => void> = new Array(36);

    private waitForKeyPress:boolean = false;
    
    constructor(){
        this.initInstructionTable();
    }

    private initInstructionTable(){
        this.instructionTable[0] = this.execute0nnn;
        this.instructionTable[1] = this.execute1nnn;
        this.instructionTable[2] = this.execute2nnn;
        this.instructionTable[3] = this.execute3xkk;
        this.instructionTable[4] = this.execute4xkk;
        this.instructionTable[5] = this.execute5xy0;
        this.instructionTable[6] = this.execute6xkk;
        this.instructionTable[7] = this.execute7xkk;
        this.instructionTable[8] = this.execute8xy;
        this.instructionTable[9] = this.execute9xy0;
        this.instructionTable[0xA] = this.executeAnnn;
        this.instructionTable[0xB] = this.executeBnnn;
        this.instructionTable[0xC] = this.executeCxkk;
        this.instructionTable[0xD] = this.executeDxyn;
        this.instructionTable[0xE] = this.executeEx;
        this.instructionTable[0xF] = this.executeFx;
    }

    public initRegisters() {
        this.pc = 0x200; // most chip8 programs start at 0x200
        this.opcode = 0;
        this.I = 0;
        this.sp = 0;
        
        // fonts take up memory address 0 to max 512 in memory
        for(let i = 0; i < this.fontset.length; ++i){
            this.memory[i] = this.fontset[i];
        }
    }

    public loadROM(rom:Uint8Array){
        // clear memory
        this.memory.fill(0);

        // load ROM into memory
        for(let i = 0; i < rom.length; ++i){
            this.memory[this.pc + i] = rom[i];
        }
    }

    public pixelCollisionOccured(){
        this.V[0xF] = 1;
    }

    private onDrawCallback:((x:number, y:number) => void) | undefined;
    setOnDrawCallback(callback:(x:number, y:number) => void){
        if(callback != null){
            this.onDrawCallback = callback;
        }
    }

    private onCLSCallback:(() => void) | undefined;
    setOnCLSCallback(callback:() => void){
        if(callback != null){
            this.onCLSCallback = callback;
        }
    }

    private skipPCIncrement:boolean = false;
    private drawFlag:boolean = false;
    public runOneCycle(){
        if(this.waitForKeyPress){
            return;
        }

        this.skipPCIncrement = false;

        // Fetch opcode - combines memory at pc and pc+1 into a single 16bit opcode
        this.opcode = (this.memory[this.pc] << 8 | this.memory[this.pc+1]);

        // Decode and Execute Instruction
        this.executeOpcode();

        // instructions are every 2 addresses since an opcode is made up of pc and pc+1
        if(!this.skipPCIncrement){
            this.pc += 2;
        }
    }

    private executeOpcode(){
        let firstNibble = this.getOpcodeFirstNibble(); // extract first 4 bits from opcode

        // Fetch corresponding function from instruction table
        let opFunction = this.instructionTable[firstNibble];
        // console.log(`opFunction for ${firstNibble}`);
        opFunction();
    }

    private getOpcodeFirstNibble() {
        return this.opcode >> 12;
    }

    private getOpcodeSecondNibble() {
        return (this.opcode >> 8) & 0x000F;
    }

    private getOpcodeThirdNibble() {
        return (this.opcode >> 4) & 0x000F;
    }

    private getOpcodeFourthNibble() {
        return this.opcode & 0x000F;
    }

    private getOpcodeThreeNibbleOperand() {
        return this.opcode & 0x0FFF;
    }

    private getOpcodeHighByte(){
        return (this.opcode >> 8) & 0x00FF;
    }

    private getOpcodeLowByte(){
        return this.opcode & 0x00FF;
    }

    // SYS, CLS, RET
    private execute0nnn = () => {
        // check second nibble
        let secondNibble = this.getOpcodeSecondNibble();

        if(secondNibble == 0){
            let lowByte = this.getOpcodeLowByte();
            if(lowByte == 0xE0){ // CLS
                if(this.onCLSCallback != null){
                    this.onCLSCallback();
                } else {
                    console.error("onCLSCallback not set!");
                }
            }else if(lowByte == 0xEE){ // RET
                this.pc = this.stack[this.sp--];
                this.skipPCIncrement = true;
            }
        } else {
            let nnn = this.getOpcodeThreeNibbleOperand();
            this.pc = nnn;
        }
    }

    // JP
    private execute1nnn = () => {
        let nnn = this.getOpcodeThreeNibbleOperand();
        this.pc = nnn;
    }

    // CALL
    private execute2nnn = () => {
        let nnn = this.getOpcodeThreeNibbleOperand();
        ++this.sp;
        this.stack[this.sp] = this.pc;
        this.pc = nnn;
    }

    // SE
    private execute3xkk = () => {
        let x = this.getOpcodeSecondNibble();
        let kk = this.getOpcodeLowByte();
        if(this.V[x] == kk){
            // skip next instruction
            this.pc += 2;
        }
    }

    // SNE
    private execute4xkk = () => {
        let x = this.getOpcodeSecondNibble();
        let kk = this.getOpcodeLowByte();
        if(this.V[x] != kk){
            // skip next instruction
            this.pc += 2;
        }
    }

    // SE
    private execute5xy0 = () => {
        let x = this.getOpcodeSecondNibble();
        let y = this.getOpcodeThirdNibble();
        if(this.V[x] == this.V[y]){
            // skip next instruction
            this.pc += 2;
        }
    }

    // LD
    private execute6xkk = () => {
        let x = this.getOpcodeSecondNibble();
        let kk = this.getOpcodeLowByte();
        this.V[x] = kk;
    }

    // ADD
    private execute7xkk = () => {
        let x = this.getOpcodeSecondNibble();
        let kk = this.getOpcodeLowByte();
        this.V[x] = this.V[x] + kk;
    }

    // 8xy
    private execute8xy = () => {
        let x = this.getOpcodeSecondNibble();
        let y = this.getOpcodeThirdNibble();
        let type = this.getOpcodeFourthNibble();

        switch(type) {
            case 0: // LD
                this.V[x] = this.V[y];
                break;
            case 1: // OR
                this.V[x] = this.V[x] | this.V[y];
                break;
            case 2: // AND
                this.V[x] = this.V[x] & this.V[y];
                break;
            case 3: // XOR
                this.V[x] = this.V[x] ^ this.V[y];
                break;
            case 4: // ADD
                let res = this.V[x] + this.V[y];
                this.V[0xF] = res > 255 ? 1 : 0;
                this.V[x] = res & 0xFF;
                break;
            case 5: // SUB
                this.V[0xF] = this.V[x] > this.V[y] ? 1 : 0;
                this.V[x] = this.V[x] - this.V[y];
                break;
            case 6: // SHR
                this.V[0xF] = (this.V[x] & 0x1) == 1 ? 1 : 0;
                this.V[x] = this.V[x] / 2;
                break;
            case 7: // SUBN
                this.V[0xF] = this.V[y] > this.V[x] ? 1 : 0;
                this.V[x] = this.V[y] - this.V[x];
                break;
            case 0xE: // SHL
                this.V[0xF] = (this.V[x] >> 15 == 1) ? 1 : 0;
                this.V[x] = this.V[x] * 2;
                break;
            default:
                console.error(`No implementation for type ${type} in execute8xy0`);
                break;
        }
    }

    // SNE
    private execute9xy0 = () => {
        let x = this.getOpcodeSecondNibble();
        let y = this.getOpcodeThirdNibble();
        if(this.V[x] != this.V[y]){
            this.pc += 2;
        }
    }

    // LD
    private executeAnnn = () => {
        let nnn = this.getOpcodeThreeNibbleOperand();
        this.I = nnn;
    }

    // JP
    private executeBnnn = () => {
        let nnn = this.getOpcodeThreeNibbleOperand();
        this.pc = this.V[0] + nnn;
    }
    
    // RND
    private executeCxkk = () => {
        let x = this.getOpcodeSecondNibble();
        let kk = this.getOpcodeLowByte();
        let randomInt = Math.floor(Math.random() * Math.floor(255));
        this.V[x] = randomInt & kk;
    }

    // Dxyn
    private executeDxyn = () => {
        let x = this.getOpcodeSecondNibble();
        let y = this.getOpcodeThirdNibble();
        let n = this.getOpcodeFourthNibble();

        for(let j = 0; j < n; ++j){
            let sprite = this.memory[this.I + j]; // sprite to use

            for(let i = 0; i < 8; ++i){
                let posX = this.V[x] + i;
                let posY = this.V[y] + j;

                if((sprite & (0x80 >> i)) != 0){
                    if(this.onDrawCallback != null){
                        this.onDrawCallback(posX, posY);
                    }
                    // let collided = gamecanvas.drawPixel(posX, posY);
                    // V[0xF] = collided ? 1 : 0;
                }
            }
        }
    }

    // Ex
    private executeEx = () => {
        let lowByte = this.getOpcodeLowByte();
        let x = this.getOpcodeSecondNibble();
        switch(lowByte) {
            case 0x9E: // SKP
                if(this.key[this.V[x]] == 1){
                    this.pc += 2;
                }
                break;
            case 0xA1: // SKNP
                if(this.key[this.V[x]] == 0){
                    this.pc += 2;
                }
                break;
            default:
                console.error(`No implementation for lowByte ${lowByte} in executeEx`);
                break;
        }
    }
    
    // Fx
    private executeFx = () => {
        let lowByte = this.getOpcodeLowByte();
        let x = this.getOpcodeSecondNibble();
        switch(lowByte) {
            case 0x07: // LD
                this.V[x] = this.dt;
                break;
            case 0x0A: // LD
                this.waitForKeyPress = true;
                break;
            case 0x15: // LD
                this.dt = this.V[x];
                break;
            case 0x18: // LD
                this.st = this.V[x];
                break;
            case 0x1E: // ADD
                this.I = this.I + this.V[x];
                break;
            case 0x29: // LD
                this.I = this.V[x] * 5;
                break;
            case 0x33: // LD
                let hundreds = this.V[x] / 100;
                let tens = (this.V[x] / 10) % 10;
                let ones = this.V[x] % 10;

                this.memory[this.I] = hundreds;
                this.memory[this.I + 1] = tens;
                this.memory[this.I + 2] = ones;
                break;
            case 0x55: // LD
                for(let i = 0; i <= x; ++i){
                    this.memory[this.I + i] = this.V[i];
                }
                break;
            case 0x65: // LD
                for(let i = 0; i <= x; ++i){
                    this.V[i] = this.memory[this.I + i];
                }
                break;
            default:
                console.error(`No implementation for lowByte ${lowByte} in executeFx`);
                break;
        }
    }
}