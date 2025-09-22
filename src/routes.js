import { Router, Request, Response } from 'express';

const router = Router();

// Example route: Home page
router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Nexus Journey!');
});

// Example route: Docs page
router.get('/docs', (req: Request, res: Response) => {
  res.send('Documentation coming soon!');
});

export default router;
