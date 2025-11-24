import { Router } from 'express';
import { RiskData } from '../models';

const router = Router();

// GET /api/admin/data - Get all risk data
router.get('/data', async (req, res) => {
  try {
    const data = await RiskData.findAll({
      order: [['createdAt', 'DESC']],
    });
    
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
    });
  }
});

// POST /api/admin/data - Create new risk data
router.post('/data', async (req, res) => {
  const { name, value, category } = req.body;
  
  try {
    const newRecord = await RiskData.create({
      name,
      value,
      category,
    });
    
    res.json({
      success: true,
      data: newRecord,
      message: 'Data created successfully',
    });
  } catch (error) {
    console.error('Error creating data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create data',
    });
  }
});

// PUT /api/admin/data/:id - Update risk data
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, value, category } = req.body;
  
  try {
    const record = await RiskData.findByPk(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
    
    await record.update({
      name,
      value,
      category,
    });
    
    res.json({
      success: true,
      data: record,
      message: 'Data updated successfully',
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update data',
    });
  }
});

// DELETE /api/admin/data/:id - Delete risk data
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const record = await RiskData.findByPk(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete data',
    });
  }
});

export default router;
