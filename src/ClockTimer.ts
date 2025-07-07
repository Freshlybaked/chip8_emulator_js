export class ClockTimer{
    public running:boolean = false;

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
        window.setInterval(this.tick, 0);
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

        if(this.tickCallback != null){
            this.tickCallback();
        }
    }
}