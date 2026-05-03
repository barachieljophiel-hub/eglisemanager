const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const licenseSchema = new mongoose.Schema({
    licenseKey: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    churchName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
        default: 'ACTIVE'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        enum: ['AIRTEL_MONEY', 'ORANGE_MONEY'],
        required: true
    },
    paymentId: String,
    amount: {
        type: Number,
        default: 15
    },
    currency: {
        type: String,
        default: 'USD'
    },
    activationDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: () => new Date(Date.now() + 99 * 365 * 24 * 60 * 60 * 1000) // 99 ans
    },
    deviceId: String,
    lastVerification: Date,
    verificationCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Générer une clé de licence unique
licenseSchema.statics.generateLicenseKey = function() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 8 === 0 && i < 31) key += '-';
    }
    return key;
};

// Vérifier la clé de licence
licenseSchema.statics.verifyLicense = async function(licenseKey) {
    const license = await this.findOne({ licenseKey: licenseKey });
    
    if (!license) {
        return { valid: false, message: 'Clé de licence introuvable' };
    }
    
    if (license.status !== 'ACTIVE') {
        return { valid: false, message: 'Licence inactive ou expirée' };
    }
    
    if (license.paymentStatus !== 'COMPLETED') {
        return { valid: false, message: 'Paiement non confirmé' };
    }
    
    if (new Date() > license.expiryDate) {
        license.status = 'EXPIRED';
        await license.save();
        return { valid: false, message: 'Licence expirée' };
    }
    
    // Mettre à jour la dernière vérification
    license.lastVerification = new Date();
    license.verificationCount += 1;
    await license.save();
    
    return { 
        valid: true, 
        message: 'Licence valide',
        license: {
            email: license.email,
            churchName: license.churchName,
            expiryDate: license.expiryDate
        }
    };
};

module.exports = mongoose.model('License', licenseSchema);
