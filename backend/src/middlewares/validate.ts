// Middleware de validation générique — KreAgency
// Prend un schéma Zod, parse req.body et :
//   - renvoie 400 avec le détail des erreurs si invalide
//   - remplace req.body par les données nettoyées/typées si valide
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        champ:   issue.path.join('.') || 'body',
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        error:   'Données invalides',
        details,
      });
      return;
    }

    // Remplace req.body par les données validées et nettoyées (trim, coercion…)
    req.body = result.data;
    next();
  };
