'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ text, size = 200, className = "" }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000', // Black QR code
            light: '#ffffff' // White background
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('QR code generation failed:', error);
      }
    };

    if (text) {
      generateQR();
    }
  }, [text, size]);

  if (!qrCodeUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Image 
        src={qrCodeUrl} 
        alt="QR Code" 
        width={size} 
        height={size}
        className="w-full h-full"
      />
    </div>
  );
}
