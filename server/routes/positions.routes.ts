import { Router } from 'express';
import { Position } from '../models';
import { syncPositionsFromExternal } from '../services/externalApiService';

const router = Router();

// Get all positions
router.get('/', async (req, res) => {
  try {
    const positions = await Position.findAll({
      order: [['deskripsi', 'ASC']],
    });
    
    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions',
    });
  }
});

// Sync positions from external API
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Syncing positions from external API...');
    
    const result = await syncPositionsFromExternal();
    
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to fetch positions from external API',
      });
    }

    const positions = Array.isArray(result.data) ? result.data : [];
    
    if (positions.length === 0) {
      return res.json({
        success: true,
        message: 'No positions to sync',
        count: 0,
      });
    }

    let syncCount = 0;
    for (const pos of positions) {
      await Position.upsert({
        jabatanID: pos.jabatan_id || pos.jabatanID,
        deskripsi: pos.deskripsi,
        level: pos.level,
      });
      syncCount++;
    }

    console.log(`✅ Synced ${syncCount} positions`);
    res.json({
      success: true,
      message: `Successfully synced ${syncCount} positions`,
      count: syncCount,
    });
  } catch (error: any) {
    console.error('Error syncing positions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync positions',
    });
  }
});

export default router;
