/* eslint-disable no-undef */
import { useState } from "react";

export const useBarcodeScanner = () => {
  const [codes, setCodes] = useState([]);

  const startBarcodeScanner = async (video, setIsVideoShown) => {
    console.log(video);
    if (window.BarcodeDetector) {
      setIsVideoShown(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        video.srcObject = stream;
        await video.play();
        const barcodeDetector = new BarcodeDetector({ formats: ["qr_code", "code_128"] });
        // можно добавить другие форматы https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API#supported_barcode_formats
        const interval = setInterval(async () => {
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) {
              setCodes(barcodes);
              stream.getTracks().forEach(track => track.stop());
              setIsVideoShown(false);
              video.remove();
              clearInterval(interval);
            }
          } catch (error) {
            console.error("Ошибка сканирования:", error);
          }
        }, 500);
      } catch (error) {
        console.error("Ошибка доступа к камере:", error);
      }
    }
  };

  return {
    codes,
    startBarcodeScanner,
  };
};
