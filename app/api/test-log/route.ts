import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
  logger.info('Test log message: Hello from /api/test-log');
  logger.error('Test error message: This is a sample error');

  return NextResponse.json({ message: 'Logs generated. Check the logs/ folder.' });
}
