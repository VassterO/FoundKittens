import { body, param, query } from 'express-validator';
import { validateRequest } from './validateRequest';

export const createCatValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('location')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [latitude, longitude]')
    .custom((value) => {
      const [lat, lng] = value;
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    })
    .withMessage('Invalid latitude/longitude values'),
  
  body('status')
    .isIn(['lost', 'found'])
    .withMessage('Status must be either "lost" or "found"'),
    
  validateRequest
];

export const addReportValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cat ID'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
    
  body('location')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location must be an array of [latitude, longitude]')
    .custom((value) => {
      const [lat, lng] = value;
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    })
    .withMessage('Invalid latitude/longitude values'),
    
  validateRequest
];

export const getCatValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cat ID'),
    
  validateRequest
];

export const listCatsValidation = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
    
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
    
  query('radius')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Radius must be between 0 and 1000 kilometers'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  validateRequest
];