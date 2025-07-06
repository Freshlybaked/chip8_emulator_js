import { useRef } from 'react';
import GameCanvas from './GameCanvas';
import { CollisionAwareRenderBuffer } from './CollisionAwareRenderBuffer';
import { ClockTimer  } from  './ClockTimer.ts';

function App() {
  const WIDTH = 64;
  const HEIGHT = 32;
  const PIXEL_SIZE = 10;

  let renderBuffer = useRef(new CollisionAwareRenderBuffer(WIDTH, HEIGHT));
  // renderBuffer.current.setPixel(0, 0, 1);
  // renderBuffer.current.setPixel(WIDTH-1, HEIGHT-1, 1);
  let clockTimer = useRef(new ClockTimer(60));

  function tick(){
  }

  clockTimer.current.setTickCallback(tick);
  clockTimer.current.start();
  
  return (
    <>
      <GameCanvas gridWidth={WIDTH} gridHeight={HEIGHT} pixelSize={PIXEL_SIZE} renderBuffer={renderBuffer.current}/>
    </>
  )
}

export default App
