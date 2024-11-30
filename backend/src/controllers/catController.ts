import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Cat from '../models/Cat';
import Report from '../models/Report';
import { GetCatsQuery } from '../types/api';
import { logger } from '../utils/logger';

export class CatController {
  async listCats(req: Request<{}, {}, {}, GetCatsQuery>, res: Response) {
    try {
      const { lat, lng, radius = 10, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // Create geospatial query if coordinates provided
      const query = lat && lng ? {
        'lastSeen.location': {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius / 6371] // Convert km to radians
          }
        }
      } : {};

      const [cats, total] = await Promise.all([
        Cat.find(query)
          .skip(skip)
          .limit(limit)
          .select('name lastSeen status photos')
          .lean(),
        Cat.countDocuments(query)
      ]);

      res.json({
        cats: cats.map(cat => ({
          id: cat._id.toString(),
          name: cat.name,
          position: cat.lastSeen?.location || [0, 0],
          status: cat.status,
          lastSeen: cat.lastSeen?.timestamp?.toISOString() || new Date().toISOString(),
          thumbnailUrl: cat.photos?.[0]
        })),
        pagination: { total, page, limit }
      });
    } catch (error) {
      logger.error('Error listing cats:', error);
      res.status(500).json({ error: 'Failed to list cats' });
    }
  }

  async getCatDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid cat ID' });
      }

      const cat = await Cat.findById(id)
        .select('name description lastSeen status photos')
        .lean();

      if (!cat) {
        return res.status(404).json({ error: 'Cat not found' });
      }

      const reports = await Report.find({ cat: id })
        .populate('reporter', 'name')
        .select('location description photos createdAt reporter')
        .lean();

      res.json({
        id: cat._id.toString(),
        name: cat.name,
        position: cat.lastSeen?.location || [0, 0],
        status: cat.status,
        lastSeen: cat.lastSeen?.timestamp?.toISOString() || new Date().toISOString(),
        description: cat.description,
        photos: cat.photos || [],
        reports: reports.map(report => ({
          id: report._id.toString(),
          location: report.location,
          description: report.description,
          timestamp: report.createdAt.toISOString(),
          photos: report.photos || [],
          reporter: report.reporter ? {
            id: report.reporter._id.toString(),
            name: report.reporter.name
          } : null
        }))
      });
    } catch (error) {
      logger.error('Error getting cat details:', error);
      res.status(500).json({ error: 'Failed to get cat details' });
    }
  }

  async createCat(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      // Parse the location from the request body
      let location: [number, number];
      try {
        location = JSON.parse(req.body.location);
        if (!Array.isArray(location) || location.length !== 2 ||
            typeof location[0] !== 'number' || typeof location[1] !== 'number') {
          throw new Error('Invalid location format');
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid location format. Expected [latitude, longitude]' });
      }

      // Extract and validate other fields
      const { name, description, status } = req.body;
      
      if (!name || !description || !status) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      if (!['lost', 'found'].includes(status)) {
        return res.status(400).json({
          error: 'Status must be either "lost" or "found"'
        });
      }

      // Process uploaded files
      const photoUrls = files.map(file => {
        // Convert backslashes to forward slashes and remove 'uploads' prefix
        const relativePath = file.path.replace(/\\/g, '/').replace('uploads/', '');
        return `/uploads/${relativePath}`;
      });

      // Create new cat
      const cat = new Cat({
        name,
        description,
        lastSeen: {
          location,
          timestamp: new Date()
        },
        status,
        photos: photoUrls
      });

      await cat.save();

      // Return response matching frontend expectations
      res.status(201).json({
        id: cat._id.toString(),
        name: cat.name,
        position: location,
        status: cat.status,
        lastSeen: cat.lastSeen.timestamp.toISOString(),
        description: cat.description,
        photos: cat.photos
      });
    } catch (error) {
      logger.error('Error creating cat:', error);
      res.status(500).json({ 
        error: 'Failed to create cat report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid cat ID' });
      }

      // Parse the location from the request body
      let location: [number, number];
      try {
        location = JSON.parse(req.body.location);
        if (!Array.isArray(location) || location.length !== 2 ||
            typeof location[0] !== 'number' || typeof location[1] !== 'number') {
          throw new Error('Invalid location format');
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid location format. Expected [latitude, longitude]' });
      }

      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({
          error: 'Description is required'
        });
      }

      // Check if cat exists
      const cat = await Cat.findById(id);
      if (!cat) {
        return res.status(404).json({ error: 'Cat not found' });
      }

      // Process uploaded files
      const photoUrls = files.map(file => {
        const relativePath = file.path.replace(/\\/g, '/').replace('uploads/', '');
        return `/uploads/${relativePath}`;
      });

      // Create new report
      const report = new Report({
        cat: id,
        description,
        location,
        photos: photoUrls
      });

      await report.save();

      // Update cat's last seen location
      cat.lastSeen = {
        location,
        timestamp: new Date()
      };
      await cat.save();

      res.status(201).json({
        id: report._id.toString(),
        location,
        description: report.description,
        timestamp: report.createdAt.toISOString(),
        photos: report.photos,
        reporter: null // Since we're not handling authentication yet
      });
    } catch (error) {
      logger.error('Error adding report:', error);
      res.status(500).json({ error: 'Failed to add report' });
    }
  }
}