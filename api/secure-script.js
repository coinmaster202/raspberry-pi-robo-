import { obfuscatedScript } from './obfuscated-assistant.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(obfuscatedScript);
}
