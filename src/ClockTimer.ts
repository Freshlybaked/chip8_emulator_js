export class ClockTimer{
    public running:boolean = false;
    public frameCount:number;
    public fps:number;
    private fpsInterval:number;
    public startTime:DOMHighResTimeStamp;
    public then:DOMHighResTimeStamp;
    public elapsed:DOMHighResTimeStamp;
    public now:DOMHighResTimeStamp;

    constructor(fps:number) {
        this.fpsInterval = 1000 / fps;
    }

    private tickCallback:(() => void) | undefined;
    setTickCallback(callback:() => void){
        if(callback != null){
            this.tickCallback = callback;
        }
    }

    start(){
        if(this.running){
            return;
        }

        this.running = true;
        this.then = window.performance.now();
        this.startTime = this.then;

        this.tick();
    }

    stop(){
        if(this.running){
            this.running = false;
        }
    }

    tick = () => {
        if (!this.running) {
            return;
        }

        requestAnimationFrame(this.tick);
        
        this.now = window.performance.now();
        this.elapsed = this.now - this.then;
        if (this.elapsed > this.fpsInterval) {
            this.then = this.now - (this.elapsed % this.fpsInterval);

            if(this.tickCallback != null){
                this.tickCallback();
            }
        }
    }

    // to deprecate?
    logFps(){
        var sinceStart = this.now - this.startTime;
        var currentFps = Math.round(1000 / (sinceStart / ++this.frameCount) * 100) / 100;
        console.log("Elapsed time= " + Math.round(sinceStart / 1000 * 100) / 100 + " secs @ " + currentFps + " fps.");
    }
}