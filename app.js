const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

const botToken = '7205477186:AAHOW41iJPQwZpDcVmNJUnJ4Jicdss4dP6o';
const bot = new TelegramBot(botToken, {polling: true});

mongoose.connect('mongodb+srv://fawazogunleye:Aabimbola2022!@cluster0.caz9xfe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
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
bot.onText(/\start (.+)/, async(msg, match) => {
    const chatId = msg.chat.id;
    const referralCode = match[1];
    let user = await User.findOne({telegramId: chatId});

    if(!user){
        user = new User({telegramId: chatId, referredBy: referralCode})
    if(referralCode){
        const referrer = await User.findOne({telegramId: referralCode})
        if(referralCode){
            referrer.referredUsers.push(chatId);
            await referrer.save();
        }
    }
    await user.save();
    bot.sendMessage(chatId, `Welcome! you were referred by ${referralCode}`)
}
else{
   bot.sendMessage(chatId, `Welcome back!`); 
}
})
bot.onText(/\/referrals/, async (msg) => {
    const chatId = msg.chat.id;

    const user = await User.findOne({ telegramId: chatId });

    if (user) {
        const referralCount = user.referredUsers.length;
        bot.sendMessage(chatId, `You have referred ${referralCount} users.`);
    } else {
        bot.sendMessage(chatId, `You haven’t referred anyone yet.`);
    }
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
