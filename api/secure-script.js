// /api/secure-script.js
import { obfuscatedScript } from './obfuscated-assistant.js';

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (ip.includes('127.0.0.1') || ip.includes('::1')) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(obfuscatedScript);
  } else {
    res.status(403).send('// Access Denied');
  }
}
