(function(root){
const C=root.CarzConfig;const asset=file=>'../my-carz-game-assets/'+file;
  const paintedCars = new Map();
  function paintedCar(index, colorId, source = asset(C.cars[index].driving)) {
    if (colorId === 'original') return Promise.resolve(source);
    const key = `${source}:${colorId}`;
    if (!paintedCars.has(key)) paintedCars.set(key, new Promise(resolve => {
      const image = new Image();
      image.onerror = () => resolve(source);
      image.onload = () => {
        try {
          const surface = document.createElement('canvas');
          const scale = Math.min(1, 768 / image.naturalHeight);
          surface.width = Math.round(image.naturalWidth * scale); surface.height = Math.round(image.naturalHeight * scale);
          const paint = surface.getContext('2d');
          paint.drawImage(image, 0, 0, surface.width, surface.height);
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
