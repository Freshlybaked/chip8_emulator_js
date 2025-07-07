export class AudioPlayer{
    private audioContext:AudioContext;
    private oscillator:OscillatorNode;
    private gainNode:GainNode;

    private playing:boolean = false;
    private volume:number;

    constructor(volume:number){
        this.volume = volume;

        this.audioContext = new window.AudioContext();
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        this.oscillator.type = 'sine'; // or 'square', 'sawtooth', 'triangle'
        this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // 440 Hz (A4 note)
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); // Volume

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.oscillator.start();
    }

    public resume(){
        this.audioContext.resume();
    }

    public beep(){
        if(this.playing) return;
        this.playing = true;
        this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime); // Volume
    }

    public stop(){
        if(!this.playing) return;
        this.playing = false;
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); // Volume
    }
}