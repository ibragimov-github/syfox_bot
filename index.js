const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramApi(process.env.BOT_TOKEN, { polling: true });
bot.setMyCommands([
  {
    command: '/start',
    description: 'Перезапуск бота'
  }
])
let result = {
  name: '',
  phoneNumber: '',
  howContact: {
    phone: '',
    messenger: ''
  },
  finalquestion: '',
  formCompleted: false
}

const resultCheck = async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const resultChatId = '-573656434'
  const optionsContact = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'позвоните', callback_data: 'callme' }], [{ text: 'напишите в мессенджер', callback_data: 'textme' }]
      ]
    })
  }
  if (msg.chat.type === 'private') {
    if (text === '/start') {
      await bot.sendMessage(chatId, 'Добро пожаловать в телеграм бот агентства')
      await bot.sendMessage(chatId, 'Пожалуйста, введите своё имя')
      result = {
        name: '',
        phoneNumber: '',
        howContact: {
          phone: '',
          messenger: ''
        },
        finalquestion: '',
        formCompleted: false
      }

    }
    else {
      if (!result.name.length) {
        result.name = text;
        return bot.sendMessage(chatId, 'Пожалуйста, введите свой номер')
      }
      if (!result.phoneNumber.length) {
        result.phoneNumber = text
        return bot.sendMessage(chatId, 'Как вам удобнее, чтобы мы с вами связались ?', optionsContact)
      }
      if (!result.formCompleted) {
        await bot.sendMessage(chatId, 'Ваш запрос принят!')
        result.formCompleted = true
        result.finalquestion = text
        return bot.sendMessage(resultChatId, `
          Имя: ${result.name},
          Номер телефона: ${result.phoneNumber}, 
          Как связаться: ${result.howContact.phone ? 'по телефону' : result.howContact.messenger},
          Вопрос: ${result.finalquestion}
        `)
      }
      if (result.formCompleted) {
        return bot.sendMessage(chatId, 'Для повторного заполнения формы нажмите /start')
      }

    }
  }

}

bot.on('message', msg => {
  resultCheck(msg)
})
bot.on('callback_query', (msg) => {
  try {
    const optionsMessage = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'WhatsApp', callback_data: 'whatsapp' }], [{ text: 'Telegram', callback_data: 'telegram' }]
        ]
      })
    }
    const text = msg.data;
    const chatId = msg.message.chat.id;
    if (text === 'callme') {
      result.howContact.phone = true;
      bot.sendMessage(chatId, 'Опишите кратко ваш вопрос/ чтобы вы хотели узнать')
    }
    if (text === 'textme') {
      bot.sendMessage(chatId, 'Как вам удобнее, чтобы мы с вами связались ?', optionsMessage)
    }
    if (text === 'whatsapp' || text === 'telegram') {
      result.howContact.messenger = text;
      bot.sendMessage(chatId, 'Опишите кратко ваш вопрос/ чтобы вы хотели узнать')
    }
  }
  catch (e) {
    console.error(e)
  }
}) 