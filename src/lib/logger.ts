// This file is machine-generated - edit at your own risk!
'use server';

import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

const logFilePath = path.join(process.cwd(), 'activity.log');

export async function logActivity(message: string): Promise<void> {
  const timestamp = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
  const logMessage = `${timestamp} - ${message}\n`;

  try {
    await fs.appendFile(logFilePath, logMessage, 'utf-8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}
