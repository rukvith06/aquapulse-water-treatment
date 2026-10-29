import type { Request, Response } from 'express';
import { createApp } from '../server';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: Request, res: Response) {
  try {
    appPromise ??= createApp({ serverless: true });
    const app = await appPromise;
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    const delegatedPath = requestUrl.searchParams.get('_path');

    if (delegatedPath) {
      requestUrl.searchParams.delete('_path');
      req.url = `/api/${delegatedPath}${requestUrl.search}`;
    }

    return app(req, res);
  } catch (error) {
    appPromise = undefined;
    console.error('Failed to initialize API handler:', error);
    return res.status(500).json({
      success: false,
      message: 'API initialization failed. Check the server configuration.',
    });
  }
}
