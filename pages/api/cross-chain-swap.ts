import { NextApiRequest, NextApiResponse } from 'next';
import { chainSwapHandler } from '../../backend/chainSwap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return await chainSwapHandler(req, res);
  } catch (error: any) {
    console.error('Cross-chain swap error:', error);
    return res.status(500).json({
      error: 'Failed to execute cross-chain swap',
      message: error.message
    });
  }
}
