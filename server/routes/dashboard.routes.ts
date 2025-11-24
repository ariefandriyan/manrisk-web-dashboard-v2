import { Router } from 'express';
import { sequelize } from '../models';
import { RiskData } from '../models';
import { Op } from 'sequelize';

const router = Router();

// Basic dashboard endpoint
router.get('/', async (req, res) => {
  try {
    const totalRecords = await RiskData.count();
    const sumResult = await RiskData.sum('value');
    const stats: any = await RiskData.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('value')), 'avgValue'],
        [sequelize.fn('MAX', sequelize.col('value')), 'maxValue'],
        [sequelize.fn('MIN', sequelize.col('value')), 'minValue'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalRecords,
        totalValue: sumResult || 0,
        averageValue: stats[0]?.avgValue || 0,
        maxValue: stats[0]?.maxValue || 0,
        minValue: stats[0]?.minValue || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

// Dashboard charts
router.get('/charts/:type', async (req, res) => {
  const { type } = req.params;
  
  try {
    let data;
    
    switch (type) {
      case 'monthly':
        // Group by month for last 6 months
        data = await RiskData.findAll({
          attributes: [
            [sequelize.fn('FORMAT', sequelize.col('created_at'), 'MMM yyyy'), 'name'],
            [sequelize.fn('SUM', sequelize.col('value')), 'value'],
          ],
          where: {
            createdAt: {
              [Op.gte]: sequelize.literal('DATEADD(month, -6, GETDATE())'),
            },
          },
          group: [sequelize.fn('FORMAT', sequelize.col('created_at'), 'MMM yyyy')],
          raw: true,
        });
        break;
        
      case 'category':
        // Group by category
        data = await RiskData.findAll({
          attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'value'],
          ],
          group: ['category'],
          raw: true,
        });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid chart type',
        });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data',
    });
  }
});

export default router;
