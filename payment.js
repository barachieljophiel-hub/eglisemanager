const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const License = require('./models/License');

// Configuration Email Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'alliancendagano7@gmail.com',
        pass: process.env.GMAIL_PASSWORD || '' // App Password
    }
});

// ✅ Paiement Airtel Money
router.post('/airtel', async (req, res) => {
    try {
        const { email, churchName, phone, amount } = req.body;
        
        if (!email || !churchName || !phone) {
            return res.status(400).json({ 
                error: 'Email, nom église et téléphone requis' 
            });
        }
        
        // Générer une clé de licence
        const licenseKey = License.generateLicenseKey();
        
        // Créer la licence
        const license = new License({
            licenseKey: licenseKey,
            email: email,
            churchName: churchName,
            paymentMethod: 'AIRTEL_MONEY',
            paymentStatus: 'PENDING',
            amount: amount || 15,
            paymentId: 'AIRTEL_' + Date.now()
        });
        
        await license.save();
        
        // 🚀 TODO: Intégrer API Airtel Money ici
        // Pour maintenant, on simule le paiement
        console.log('📱 Paiement Airtel Money demandé:', {
            email, churchName, phone, amount,
            paymentId: license.paymentId
        });
        
        // Envoyer email de confirmation
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: '📱 Paiement EgliseManager - Airtel Money',
            html: `
                <h2>Bonjour ${churchName},</h2>
                <p>Votre demande de paiement a été créée.</p>
                <p><strong>Montant:</strong> $${amount || 15} USD</p>
                <p><strong>Numéro Airtel:</strong> ${phone}</p>
                <p><strong>ID Paiement:</strong> ${license.paymentId}</p>
                <p>Veuillez confirmer le paiement sur votre téléphone Airtel Money.</p>
                <p>Une fois confirmé, vous recevrez votre clé de licence.</p>
                <p>Support: alliancendagano7@gmail.com</p>
            `
        });
        
        res.json({
            success: true,
            message: 'Demande de paiement créée. Veuillez confirmer sur Airtel Money.',
            paymentId: license.paymentId,
            licenseKey: licenseKey // Temporaire, à confirmer après paiement
        });
        
    } catch (error) {
        console.error('Erreur paiement Airtel:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Paiement Orange Money
router.post('/orange', async (req, res) => {
    try {
        const { email, churchName, phone, amount } = req.body;
        
        if (!email || !churchName || !phone) {
            return res.status(400).json({ 
                error: 'Email, nom église et téléphone requis' 
            });
        }
        
        // Générer une clé de licence
        const licenseKey = License.generateLicenseKey();
        
        // Créer la licence
        const license = new License({
            licenseKey: licenseKey,
            email: email,
            churchName: churchName,
            paymentMethod: 'ORANGE_MONEY',
            paymentStatus: 'PENDING',
            amount: amount || 15,
            paymentId: 'ORANGE_' + Date.now()
        });
        
        await license.save();
        
        // 🚀 TODO: Intégrer API Orange Money ici
        // Pour maintenant, on simule le paiement
        console.log('📱 Paiement Orange Money demandé:', {
            email, churchName, phone, amount,
            paymentId: license.paymentId
        });
        
        // Envoyer email de confirmation
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: '📱 Paiement EgliseManager - Orange Money',
            html: `
                <h2>Bonjour ${churchName},</h2>
                <p>Votre demande de paiement a été créée.</p>
                <p><strong>Montant:</strong> $${amount || 15} USD</p>
                <p><strong>Numéro Orange:</strong> ${phone}</p>
                <p><strong>ID Paiement:</strong> ${license.paymentId}</p>
                <p>Veuillez confirmer le paiement sur votre téléphone Orange Money.</p>
                <p>Une fois confirmé, vous recevrez votre clé de licence.</p>
                <p>Support: alliancendagano7@gmail.com</p>
            `
        });
        
        res.json({
            success: true,
            message: 'Demande de paiement créée. Veuillez confirmer sur Orange Money.',
            paymentId: license.paymentId,
            licenseKey: licenseKey // Temporaire, à confirmer après paiement
        });
        
    } catch (error) {
        console.error('Erreur paiement Orange:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Webhook - Confirmer paiement (reçu de Airtel/Orange)
router.post('/webhook/confirm', async (req, res) => {
    try {
        const { paymentId, status } = req.body;
        
        if (!paymentId) {
            return res.status(400).json({ error: 'Payment ID requis' });
        }
        
        const license = await License.findOne({ paymentId: paymentId });
        
        if (!license) {
            return res.status(404).json({ error: 'Licence non trouvée' });
        }
        
        if (status === 'SUCCESS' || status === 'COMPLETED') {
            license.paymentStatus = 'COMPLETED';
            license.status = 'ACTIVE';
            await license.save();
            
            // Envoyer la clé de licence par email
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: license.email,
                subject: '🎉 Licence EgliseManager Activée!',
                html: `
                    <h2>Bienvenue à EgliseManager! 🎉</h2>
                    <p>Votre paiement a été confirmé avec succès!</p>
                    <h3 style="background: #667eea; color: white; padding: 10px; border-radius: 5px;">
                        Votre Clé de Licence:
                    </h3>
                    <p style="font-size: 18px; font-family: monospace; letter-spacing: 2px;">
                        <strong>${license.licenseKey}</strong>
                    </p>
                    <ol>
                        <li>Lancez l'application EgliseManager</li>
                        <li>Cliquez sur "Activer License"</li>
                        <li>Collez votre clé ci-dessus</li>
                        <li>Cliquez sur "Activer"</li>
                    </ol>
                    <p><strong>✨ Vous avez une licence à vie!</strong></p>
                    <p>Support: alliancendagano7@gmail.com</p>
                `
            });
            
            return res.json({
                success: true,
                message: 'Paiement confirmé, licence activée!',
                licenseKey: license.licenseKey
            });
        } else {
            license.paymentStatus = 'FAILED';
            await license.save();
            
            return res.status(400).json({
                success: false,
                message: 'Paiement échoué'
            });
        }
        
    } catch (error) {
        console.error('Erreur webhook:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Vérifier statut paiement
router.get('/status/:paymentId', async (req, res) => {
    try {
        const license = await License.findOne({ paymentId: req.params.paymentId });
        
        if (!license) {
            return res.status(404).json({ error: 'Paiement non trouvé' });
        }
        
        res.json({
            paymentId: license.paymentId,
            status: license.paymentStatus,
            licenseKey: license.paymentStatus === 'COMPLETED' ? license.licenseKey : null,
            message: license.paymentStatus === 'COMPLETED' ? 'Paiement confirmé' : 'En attente de confirmation'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
