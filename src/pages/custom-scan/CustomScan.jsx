import { useState } from 'react';
import QrReader from 'react-qr-scanner';

const CustomScan = () => {
  const [scanResult, setScanResult] = useState('');

  const handleScan = (data) => {
    console.log(123);
    if (data && data.text) {
      setScanResult(data.text);
    } else if (data) {
      setScanResult(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        facingMode="environment"
      />
      <p>Результат: {scanResult}</p>
    </div>
  );
};

export default CustomScan;
