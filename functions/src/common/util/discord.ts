import Discord from "discord.js";

const API = new Discord.REST().setToken(process.env.DISCORD_API!);

// 1102910816367427614

const DiscordHelper = {
  async message(content: string, threadId?: string) {
    threadId = threadId || "1136217067037671474";
    try {
      await API.post(Discord.Routes.channelMessages(threadId), {
        body: {
          content,
        },
      });
    } catch (err: any) {
      console.error(err);
      return;
    }
  },
};

export default DiscordHelper;
