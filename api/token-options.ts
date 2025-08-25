import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenOptionsHandler } from '../backend/chainSwap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return await getTokenOptionsHandler(req, res);
  } catch (error: any) {
    console.error('Token options error:', error);
    return res.status(500).json({
      error: 'Failed to get token options',
      message: error.message
    });
  }
} 