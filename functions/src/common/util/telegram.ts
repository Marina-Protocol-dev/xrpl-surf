import axios from "axios";

const telegramBotAPIKey = process.env.TELEGRAM_BOT_API;

const TelegramHelper = {
  async send(chatId: string, message: string) {
    try {
      if (!chatId) {
        return false;
      }

      if (!message) {
        return false;
      }

      const WebhookURL = `https://api.telegram.org/bot${telegramBotAPIKey}/sendMessage`;

      const ret = await axios.post(WebhookURL, {
        // parse_mode: "markdown",
        chat_id: chatId,
        text: message,
      });

      // console.log(ret);

      return ret.status == 200;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },
  async sendLog(message: string) {
    const chatId = process.env.TELEGRAM_LOG_CHAT_ID;
    return await this.send(chatId!, message);
  },

  async sendDailyLog(message: string) {
    const chatId = process.env.TELEGRAM_DAILY_LOG_CHAT_ID;
    return await this.send(chatId!, message);
  },
};

export default TelegramHelper;
