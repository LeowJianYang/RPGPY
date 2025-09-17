import {Howl} from "howler";

export class BgmManager {
    // private mainTheme: Howl;
    private currentTheme: Howl | null = null;
    private isMuted: boolean = false;
    private isPlaying: boolean = false;

    play(src: string, loop = true, onEnd?: () => void) {
   
    if (this.currentTheme) {
      this.currentTheme.stop();
      this.currentTheme.unload();
      this.currentTheme = null;
    }

    this.currentTheme = new Howl({
      src: [src],
      loop,
      volume: 0.8,
      mute: this.isMuted, 
      onend: () => {
        if (onEnd) onEnd();
      },
    });

    this.currentTheme.play();
    this.isPlaying = true;
  }

  stop() {
    if (this.currentTheme) {
      this.currentTheme.stop();
      this.currentTheme.unload();
      this.currentTheme = null;
      this.isPlaying = false;
    }
  }
  pause() {
    if(this.currentTheme){
      this.currentTheme.pause();
      this.isPlaying = false;
    };
  }

  resume() {
    if(this.currentTheme){
      this.currentTheme.play();
      this.isPlaying = true;
    }
  }

  toggleMute(){
    this.isMuted = !this.isMuted;
  
    if(this.currentTheme){
      this.currentTheme.mute(this.isMuted);
    }
    return this.isMuted;
  }

  isBgmMuted(){
    return this.isMuted;
  }
  isBgmPlaying(){
    return this.isPlaying;
  } 
}