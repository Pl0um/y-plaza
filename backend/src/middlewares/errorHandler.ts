import { Request, Response, NextFunction } from 'express';

// Interface pour les erreurs avec code HTTP optionnel
interface AppError extends Error {
  statusCode?: number;
}

// Middleware de gestion centralisée des erreurs
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Erreur interne du serveur';

  console.error(`[Erreur ${statusCode}]`, err.message, (err as any).cause ?? '');

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
