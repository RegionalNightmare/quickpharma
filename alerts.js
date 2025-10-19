// routes/alerts.js - Alert Routes
const express = require('express');
const router = express.Router();
const { Alert } = require('../models');

// GET all alerts
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.getAll();
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET alert by ID
router.get('/:id', async (req, res) => {
    try {
        const db = require('../config/database');
        const query = `
            SELECT a.*, h.name as hospital_name
            FROM alerts a
            LEFT JOIN hospitals h ON a.hospital_id = h.id
            WHERE a.id = ?
        `;
        const [alerts] = await db.execute(query, [req.params.id]);
        
        if (alerts.length === 0) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }
        
        res.json({ success: true, data: alerts[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET alerts by hospital
router.get('/hospital/:hospitalId', async (req, res) => {
    try {
        const alerts = await Alert.getByHospital(req.params.hospitalId);
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET unread alerts by hospital
router.get('/hospital/:hospitalId/unread', async (req, res) => {
    try {
        const db = require('../config/database');
        const query = `
            SELECT * FROM alerts 
            WHERE hospital_id = ? AND is_read = 0 
            ORDER BY created_at DESC
        `;
        const [alerts] = await db.execute(query, [req.params.hospitalId]);
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET alerts by type
router.get('/type/:type', async (req, res) => {
    try {
        const db = require('../config/database');
        const query = `
            SELECT a.*, h.name as hospital_name
            FROM alerts a
            LEFT JOIN hospitals h ON a.hospital_id = h.id
            WHERE a.type = ?
            ORDER BY a.created_at DESC
        `;
        const [alerts] = await db.execute(query, [req.params.type]);
        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET alert statistics for a hospital
router.get('/hospital/:hospitalId/statistics', async (req, res) => {
    try {
        const db = require('../config/database');
        const hospitalId = req.params.hospitalId;
        
        const [totalAlerts] = await db.execute(
            'SELECT COUNT(*) as count FROM alerts WHERE hospital_id = ?',
            [hospitalId]
        );
        
        const [unreadAlerts] = await db.execute(
            'SELECT COUNT(*) as count FROM alerts WHERE hospital_id = ? AND is_read = 0',
            [hospitalId]
        );
        
        const [alertsByType] = await db.execute(
            'SELECT type, COUNT(*) as count FROM alerts WHERE hospital_id = ? GROUP BY type',
            [hospitalId]
        );
        
        res.json({
            success: true,
            data: {
                total_alerts: totalAlerts[0].count,
                unread_alerts: unreadAlerts[0].count,
                alerts_by_type: alertsByType
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE alert
router.post('/', async (req, res) => {
    try {
        const { hospital_id, message, type } = req.body;
        
        // Validation
        if (!hospital_id || !message || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hospital ID, message, and type are required' 
            });
        }
        
        const id = await Alert.create(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Alert created successfully', 
            id 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE bulk alerts (for multiple hospitals)
router.post('/bulk', async (req, res) => {
    try {
        const { hospital_ids, message, type } = req.body;
        
        // Validation
        if (!hospital_ids || !Array.isArray(hospital_ids) || !message || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hospital IDs (array), message, and type are required' 
            });
        }
        
        const createdAlerts = [];
        for (const hospitalId of hospital_ids) {
            const id = await Alert.create({
                hospital_id: hospitalId,
                message,
                type,
                is_read: 0
            });
            createdAlerts.push(id);
        }
        
        res.status(201).json({ 
            success: true, 
            message: `${createdAlerts.length} alerts created successfully`,
            ids: createdAlerts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// MARK alert as read
router.patch('/:id/read', async (req, res) => {
    try {
        const affectedRows = await Alert.markAsRead(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }
        res.json({ success: true, message: 'Alert marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// MARK all alerts as read for a hospital
router.patch('/hospital/:hospitalId/read-all', async (req, res) => {
    try {
        const db = require('../config/database');
        const query = 'UPDATE alerts SET is_read = 1 WHERE hospital_id = ? AND is_read = 0';
        const [result] = await db.execute(query, [req.params.hospitalId]);
        
        res.json({ 
            success: true, 
            message: `${result.affectedRows} alerts marked as read` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE alert
router.delete('/:id', async (req, res) => {
    try {
        const affectedRows = await Alert.delete(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }
        res.json({ success: true, message: 'Alert deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE all read alerts for a hospital
router.delete('/hospital/:hospitalId/read', async (req, res) => {
    try {
        const db = require('../config/database');
        const query = 'DELETE FROM alerts WHERE hospital_id = ? AND is_read = 1';
        const [result] = await db.execute(query, [req.params.hospitalId]);
        
        res.json({ 
            success: true, 
            message: `${result.affectedRows} read alerts deleted` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE all alerts for a hospital
router.delete('/hospital/:hospitalId/all', async (req, res) => {
    try {
        const db = require('../config/database');
        const query = 'DELETE FROM alerts WHERE hospital_id = ?';
        const [result] = await db.execute(query, [req.params.hospitalId]);
        
        res.json({ 
            success: true, 
            message: `${result.affectedRows} alerts deleted` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
