const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramApi(process.env.BOT_TOKEN, { polling: true });
bot.setMyCommands([
  {
    command: '/start',
    description: 'Перезапуск бота'
  }
])
let result = {}
const optionsContact = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'позвоните', callback_data: 'callme' }], [{ text: 'напишите в мессенджер', callback_data: 'textme' }]
    ]
  })
}
const optionsMessage = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: 'WhatsApp', callback_data: 'whatsapp' }], [{ text: 'Telegram', callback_data: 'telegram' }]
    ]
  })
}
bot.on('message', async msg => {
  const messageText = msg.text;
  const resultChatId = '-1001773406853'
  if (!(msg.chat.id in result)) {
    result[msg.chat.id] = {
      name: 'expects...',
      phoneNumber: '',
      howContact: {
        phone: '',
        messenger: ''
      },
      finalquestion: '',
      formCompleted: false
    }
  }
  if (msg.chat.type === 'private') {
    if (messageText === '/start') {
      result[msg.chat.id] = {
        name: 'expects...',
        phoneNumber: '',
        howContact: {
          phone: '',
          messenger: ''
        },
        finalquestion: '',
        formCompleted: false
      }
      await bot.sendMessage(msg.chat.id, `Hey, guys! \n \nЭто seyfox_bot, он поможет вам быстро сформулировать свой запрос и получить ответы на все ваши вопросы. \n \nEnjoy 😉`)
      return bot.sendMessage(msg.chat.id, 'Пожалуйста, введите своё имя')
    }

    if (result[msg.chat.id].name === 'expects...') {
      result[msg.chat.id].name = messageText;
      return bot.sendMessage(msg.chat.id, 'Пожалуйста, введите свой номер');
    }
    if (result[msg.chat.id].name.length && !result[msg.chat.id].phoneNumber.length) {
      result[msg.chat.id].phoneNumber = messageText;
      return bot.sendMessage(msg.chat.id, 'Как вам удобнее, чтобы мы с вами связались ?', optionsContact)
    }
    if (!(result[msg.chat.id].formCompleted) && result[msg.chat.id].howContact.phone || !!result[msg.chat.id].howContact.messenger.length && !(result[msg.chat.id].formCompleted)) {
      if (!result[msg.chat.id].formCompleted) {
        console.log(true)
      }
      console.log(!result[msg.chat.id].formCompleted)
      result[msg.chat.id].finalquestion = messageText;
      result[msg.chat.id].formCompleted = true;
      await bot.sendMessage(msg.chat.id, 'Спасибо, что оставили заявку, мы изучим её и свяжемся с вами в скором времени.')
      return bot.sendMessage(resultChatId, `
        Имя: ${result[msg.chat.id].name},
        Номер телефона: ${result[msg.chat.id].phoneNumber}, 
        Как связаться: ${result[msg.chat.id].howContact.phone ? 'по телефону' : result[msg.chat.id].howContact.messenger},
        Вопрос: ${result[msg.chat.id].finalquestion}
      `)
    }
    if (result[msg.chat.id].formCompleted) {
      await bot.sendMessage(msg.chat.id, 'Для повторного заполнения формы нажмите /start')
    }
  }

})

bot.on('callback_query', async msg => {
  const buttonText = msg.data;
  if (msg.message.chat.id in result) {
    if (buttonText === 'callme') {
      result[msg.message.chat.id].howContact.phone = true;
      await bot.sendMessage(msg.message.chat.id, 'Опишите кратко ваш вопрос / чтобы вы хотели узнать')
    }
    if (buttonText === 'textme') {
      await bot.sendMessage(msg.message.chat.id, 'Выберите мессенджер', optionsMessage)
    }
    if (buttonText === 'whatsapp' || buttonText === 'telegram') {
      result[msg.message.chat.id].howContact.messenger = buttonText;
      await bot.sendMessage(msg.message.chat.id, 'Опишите кратко ваш вопрос / чтобы вы хотели узнать')
    }
  }
})