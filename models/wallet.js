    const mongoose = require('mongoose');

    const WalletSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
        },
        transaction: [{
            transactionId: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(), 
                required: true,
            },
            type: {
                type: String,
                enum: ['credit', 'debit', 'online payment'],
                required: false,
            },
            amount: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            description: {
                type: String,
            },
        }],
    });

    const Wallet = mongoose.model('Wallet', WalletSchema);

    module.exports = Wallet;
