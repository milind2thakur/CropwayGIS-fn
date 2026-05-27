import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const src = 'C:\\CropwayGIS\\consultaion image.svg';
    const dest = path.join(process.cwd(), 'public', 'consultation-image.svg');
    fs.copyFileSync(src, dest);
    return NextResponse.json({ success: true, message: 'Copied successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
