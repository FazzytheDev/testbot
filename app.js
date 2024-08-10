const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
const botToken = '7234402311:AAF2sSfbM3Bxw1CPGFaLvNbMIlzVN0fNS8w';
const bot = new TelegramBot(botToken, {polling: true});

mongoose.connect('mongodb+srv://fawazogunleye:Aabimbola2022@cluster0.caz9xfe.mongodb.net/fazzy?retryWrites=true&w=majority&appName=Cluster0');
const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    referredBy: {
        type: String
    },
    referredUsers: [{type: String}]
});
const User = mongoose.model('User', userSchema);

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id.toString(); // Convert to string for MongoDB consistency
    const referralCode = match[1]; // Capture the referral code, if provided

    try {
        // Check if the user already exists in the database
        let user = await User.findOne({ telegramId: chatId });

        if (!user) {
            // If the user doesn't exist, create a new user
            user = new User({ telegramId: chatId, referredBy: referralCode || null });

            if (referralCode) {
                // If there is a referral code, find the referrer and add this user to their referredUsers list
                const referrer = await User.findOne({ telegramId: referralCode });

                if (referrer) {
                    referrer.referredUsers.push(chatId);
                    await referrer.save();
                }
            }

            await user.save();
            bot.sendMessage(chatId, referralCode ? `Welcome! You were referred by user ${referralCode}.` : 'Welcome!');
        } else {
            bot.sendMessage(chatId, `Welcome back!: ${chatId}`);
        }
    } catch (error) {
        console.error('Error handling /start command:', error);
        bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
});

bot.onText(/\/referrals/, async (msg) => {
    const chatId = msg.chat.id;

    const user = await User.findOne({ telegramId: chatId });

    if (user) {
        const referralCount = user.referredUsers.length;
        bot.sendMessage(chatId, `You have referred ${referralCount} users.`);
    } else {
        bot.sendMessage(chatId, `You haven’t referred anyone yet. ${chatId}`);
    }
});
app.get('/', async(req, res) => {
    res.sendFile('index.html');
})
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
