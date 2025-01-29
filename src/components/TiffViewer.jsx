import React, { useEffect, useRef } from "react";
import * as UTIF from "utif";
 
function TiffViewer({ tiffUrl }) {
  const canvasRef = useRef(null);
 
  useEffect(() => {
    async function renderTiff() {
      const response = await fetch(tiffUrl);
      const arrayBuffer = await response.arrayBuffer();
      const ifds = UTIF.decode(arrayBuffer);
      UTIF.decodeImage(arrayBuffer, ifds[0]);
      const rgba = UTIF.toRGBA8(ifds[0]);
 
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = new ImageData(
        new Uint8ClampedArray(rgba),
        ifds[0].width,
        ifds[0].height
      );
      canvas.width = ifds[0].width;
      canvas.height = ifds[0].height;
      ctx.putImageData(imageData, 0, 0);
    }
 
    renderTiff();
  }, [tiffUrl]);
 
  return <canvas style={{width:"100%"}} ref={canvasRef} />;
}
 
export default TiffViewer;