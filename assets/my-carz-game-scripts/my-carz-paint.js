(function(root){
const C=root.CarzConfig;const asset=file=>new URL('../my-carz-game-assets/'+file,document.baseURI).href;
  const paintedCars = new Map();
  function paintedCar(index, colorId, source = asset(C.cars[index].driving)) {
    source = new URL(source, document.baseURI).href;
    const garage = source === asset(C.cars[index].garagePreview) ? C.cars[index].garageLayout : null;
    const layout = source === asset(C.cars[index].driving) ? C.cars[index].drivingLayout : null;
    if (colorId === 'original' && !layout && !garage) return Promise.resolve(source);
    const key = `${source}:${colorId}`;
    if (!paintedCars.has(key)) paintedCars.set(key, new Promise(resolve => {
      const image = new Image();
      image.onerror = () => resolve(source);
      image.onload = () => {
        try {
          const surface = document.createElement('canvas');
          const [x,y,w,h] = (garage || layout)?.crop || [0,0,image.naturalWidth,image.naturalHeight];
          const rotated = layout && Math.abs(layout.rotation) === 90;
          const width = garage?.width || layout?.width || (rotated ? h : w), height = garage?.height || layout?.height || (rotated ? w : h);
          const scale = Math.min(1, 768 / height);
          surface.width = Math.round(width * scale); surface.height = Math.round(height * scale);
          const paint = surface.getContext('2d');
          if(garage){
            const fit=garage.carWidth/w,drawW=w*fit*scale,drawH=h*fit*scale;
            paint.drawImage(image,x,y,w,h,(surface.width-drawW)/2,garage.groundY*scale-drawH,drawW,drawH);
          }else if(layout?.carHeight){
            const fit=layout.carHeight/h,drawW=w*fit*scale,drawH=h*fit*scale;
            paint.drawImage(image,x,y,w,h,(surface.width-drawW)/2,(surface.height-drawH)/2,drawW,drawH);
          }else{
            paint.translate(surface.width/2,surface.height/2);
            paint.rotate((layout?.rotation || 0)*Math.PI/180);
            paint.drawImage(image,x,y,w,h,-w*scale/2,-h*scale/2,w*scale,h*scale);
            paint.setTransform(1,0,0,1,0,0);
          }
          if(colorId==='original'){resolve(surface.toDataURL('image/png'));return;}
          const pixels = paint.getImageData(0, 0, surface.width, surface.height);
          const hex = C.colors.find(color => color[0] === colorId)[2];
          const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
          for (let i = 0; i < pixels.data.length; i += 4) {
            const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
            const high = Math.max(r, g, b), low = Math.min(r, g, b);
            // All current cars have light body panels; retain dark glass, tyres, and colored lamps.
            const lightBody = low > 105 && high - low < 65;
            if (!pixels.data[i + 3] || !lightBody) continue;
            const shade = high / 255;
            const highlight = Math.max(0, (low - 225) / 30) * .65;
            for (let channel = 0; channel < 3; channel++) pixels.data[i + channel] = rgb[channel] * shade * (1 - highlight) + 255 * highlight;
          }
          paint.putImageData(pixels, 0, 0); resolve(surface.toDataURL('image/png'));
        } catch (_) { resolve(source); }
      };
      image.src = source;
    }));
    return paintedCars.get(key);
  }

root.CarzPaint={paintedCar};
})(globalThis);
