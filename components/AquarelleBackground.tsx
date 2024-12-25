import { useEffect, useState } from 'react';
import Image from 'next/image';

type Color = "blau" | "rot" | "gelb" | "grün";

interface Props {
  fixedColor: Color;
  className?: string;
  children: React.ReactNode;
}

export function AquarelleBackground({ fixedColor, className = '', children }: Props) {
  const [imagePath, setImagePath] = useState<string>('');
  
  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 8) + 1;
    setImagePath(`/images/aquarelle/${fixedColor}/${randomNumber}.png`);
  }, [fixedColor]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imagePath && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={imagePath}
            alt="Background"
            fill
            className="object-cover opacity-25"
            priority
          />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
} 