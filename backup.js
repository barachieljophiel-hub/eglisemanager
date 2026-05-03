const express = require('express');
const router = express.Router();

// Stockage temporaire des backups (en production, utiliser S3 ou autre)
const backups = [];

// ✅ Sauvegarder les données
router.post('/save', async (req, res) => {
    try {
        const { licenseKey, data } = req.body;
        
        if (!licenseKey || !data) {
            return res.status(400).json({ 
                error: 'License Key et données requises' 
            });
        }
        
        const backup = {
            id: Date.now().toString(),
            licenseKey: licenseKey,
            data: data,
            createdAt: new Date(),
            size: JSON.stringify(data).length
        };
        
        backups.push(backup);
        
        // Garder seulement les 10 derniers backups
        if (backups.length > 10) {
            backups.shift();
        }
        
        console.log(`✅ Backup sauvegardé pour ${licenseKey}`);
        
        res.json({
            success: true,
            message: 'Données sauvegardées avec succès',
            backupId: backup.id,
            timestamp: backup.createdAt,
            size: backup.size
        });
        
    } catch (error) {
        console.error('Erreur backup:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Récupérer les données
router.get('/restore/:licenseKey', async (req, res) => {
    try {
        const { licenseKey } = req.params;
        
        // Trouver le backup le plus récent
        const backup = backups
            .filter(b => b.licenseKey === licenseKey)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        if (!backup) {
            return res.status(404).json({ 
                error: 'Aucun backup trouvé pour cette licence' 
            });
        }
        
        res.json({
            success: true,
            data: backup.data,
            timestamp: backup.createdAt,
            size: backup.size
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Lister les backups
router.get('/list/:licenseKey', async (req, res) => {
    try {
        const { licenseKey } = req.params;
        
        const userBackups = backups
            .filter(b => b.licenseKey === licenseKey)
            .map(b => ({
                id: b.id,
                createdAt: b.createdAt,
                size: b.size
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            backups: userBackups,
            total: userBackups.length
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Supprimer un backup
router.delete('/:backupId', async (req, res) => {
    try {
        const index = backups.findIndex(b => b.id === req.params.backupId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Backup non trouvé' });
        }
        
        backups.splice(index, 1);
        
        res.json({
            success: true,
            message: 'Backup supprimé'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
