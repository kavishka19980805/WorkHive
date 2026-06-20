import { parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

async function parseResume() {
  const { filePath, textOutputPath } = workerData;

  if (!filePath) {
    throw new Error('No PDF file path provided');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file does not exist at path: ${filePath}`);
  }

  const dataBuffer = fs.readFileSync(filePath);
  
  // Parse PDF
  const data = await pdf(dataBuffer);
  const text = data.text || '';

  // Write plain text copy
  if (textOutputPath) {
    // Ensure parent directory exists
    const dir = path.dirname(textOutputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(textOutputPath, text, 'utf-8');
    console.log(`[Resume Worker] Text copy written to: ${textOutputPath}`);
  }

  console.log(`[Resume Worker] PDF parsed successfully, characters: ${text.length}`);

  if (parentPort) {
    parentPort.postMessage({ success: true, text });
  }
}

parseResume().catch((err) => {
  console.error('[Resume Worker] Error parsing resume:', err);
  if (parentPort) {
    parentPort.postMessage({ success: false, error: err.message });
  }
  process.exit(1);
});
