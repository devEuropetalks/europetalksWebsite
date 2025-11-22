import { useState } from "react";
import Image from "next/image";

type Color = "blau" | "rot" | "gelb" | "grün";

interface Props {
  fixedColor: Color;
  className?: string;
  children: React.ReactNode;
}

export function AquarelleBackground({
  fixedColor,
  className = "",
  children,
}: Props) {
  // Use useState with lazy initializer to generate random number only once
  const [randomNumber] = useState(() => Math.floor(Math.random() * 8) + 1);
  const imagePath = `/images/aquarelle/${fixedColor}/${randomNumber}.png`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -z-10">
        <Image
          src={imagePath}
          alt="Background"
          fill
          className="object-cover opacity-25"
          priority
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
