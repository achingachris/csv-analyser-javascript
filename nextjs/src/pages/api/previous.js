import { analyzedFiles } from './upload';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(analyzedFiles);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
