const TelegramBot = require('node-telegram-bot-api');

const token = 'token';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/info/, (msg, match)=>{
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, `Your id: ${chatId}`);
});

bot.on('message', (msg)=>{
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `echo: ${msg.text}, ${chatId}`);
})