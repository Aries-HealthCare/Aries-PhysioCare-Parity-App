import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Polyfill for SlowBuffer which is removed in modern Node.js but required by older JWT dependencies
const bufferModule = require('buffer');
if (typeof bufferModule.SlowBuffer === 'undefined') {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
