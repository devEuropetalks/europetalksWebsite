import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const slideshowDir = path.join(process.cwd(), 'public/images/slideshow');
    const files = fs.readdirSync(slideshowDir);
    
    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => ({
        src: `/images/slideshow/${file}`,
        alt: file.split('.')[0].replace(/-/g, ' '),
        caption: file.split('.')[0].replace(/-/g, ' ')
      }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading slideshow directory:', error);
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 });
  }
} 