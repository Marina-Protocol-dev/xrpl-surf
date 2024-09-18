import * as admin from "firebase-admin";
import { TIER1_BOOST } from "../constants/constants";

export const MessageUtils = {
  message(
    title: string,
    body: string,
    imageUrl?: string,
    linkUrl?: string,
    pushId?: string
  ): any {
    return {
      notification: {
        title: "Marina Protocol",
        body: title + (body ? "\n" + body : ""),
        imageUrl: imageUrl || undefined,
      },
      data: {
        linkUrl: linkUrl || "home",
        pushId: pushId || Date.now() + "",
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "marina-protocol-channel-1",
          priority: "high",
          visibility: "public",
        },
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            sound: "default",
            contentAvailable: true,
            badge: 1,
          },
        },
      },
    };
  },

  async referral(token: string, pushId: string) {
    return await this.send(
      token,
      "Referral Boosted",
      `+${TIER1_BOOST / 100} point`,
      "",
      "",
      pushId
    );
  },

  async link(token: string, linkUrl: string, pushId: string) {
    return await this.send(token, "Link Test", linkUrl, "", linkUrl, pushId);
  },

  async send(
    token: string,
    title: string,
    body: string,
    imageUrl: string,
    linkUrl: string,
    pushId: string
  ) {
    const ret: {
      code: number;
      message: string;
      result: any;
    } = {
      code: 0,
      message: "",
      result: null,
    };

    try {
      const res = await admin.messaging().send({
        ...this.message(title, body, imageUrl, linkUrl, pushId),
        token,
      });
      ret.result = res;
      return ret;
    } catch (error) {
      console.error("sendToTopic failed", error);
      ret.code = 1;
      ret.message = JSON.stringify(error);
      return ret;
    }
  },

  // https://firebase.google.com/docs/cloud-messaging/send-message?hl=ko
  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    imageUrl: string,
    linkUrl: string,
    pushId: string
  ) {
    const ret: {
      code: number;
      message: string;
      result: any;
    } = {
      code: 0,
      message: "",
      result: null,
    };

    try {
      const res = await admin.messaging().sendEachForMulticast({
        ...this.message(title, body, imageUrl, linkUrl, pushId),
        tokens,
      });
      ret.result = res;
      return ret;
    } catch (error) {
      console.error("sendToTopic failed", error);
      ret.code = 1;
      ret.message = JSON.stringify(error);
      return ret;
    }
  },

  async sendAll(
    tokens: string[],
    title: string,
    body: string,
    imageUrl: string,
    linkUrl: string
  ) {
    const ret: {
      code: number;
      message: string;
      result: any;
    } = {
      code: 0,
      message: "",
      result: null,
    };

    try {
      const messages: any = [];
      tokens.forEach((token) => {
        messages.push({
          ...this.message(title, body, imageUrl, linkUrl),
          token,
        });
      });

      const res = await admin.messaging().sendEach(messages);
      ret.result = res;
      return ret;
    } catch (error) {
      console.error("sendToTopic failed", error);
      ret.code = 1;
      ret.message = JSON.stringify(error);
      return ret;
    }
  },

  // 1회 요청시 tokens 는 최대 1000개까지 지원
  // 그 이상 요청시 messaging/invalid-argument 오류가 표시되면서 요청이 실패
  async subscribeToTopic(topic: string, tokens: string | string[]) {
    try {
      if (!topic || !tokens) {
        return null;
      }

      const res = await admin.messaging().subscribeToTopic(tokens, topic);
      return res;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },

  async unsubscribeFromTopic(topic: string, tokens: string | string[]) {
    try {
      if (!topic || !tokens) {
        return null;
      }

      const res = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return res;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  },

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    imageUrl: string,
    linkUrl: string,
    pushId: string
  ) {
    const ret: {
      code: number;
      message: string;
      result: any;
    } = {
      code: 0,
      message: "",
      result: null,
    };

    try {
      const res = await admin.messaging().send({
        ...this.message(title, body, imageUrl, linkUrl, pushId),
        topic,
      });

      // await admin
      //   .messaging()
      //   .sendToTopic(
      //     topic,
      //     this.message(title, body, imageUrl, linkUrl, pushId),
      //     {
      //       ...options
      //     }
      //   );
      ret.result = res;
      return ret;
    } catch (error) {
      console.error("sendToTopic failed", error);
      ret.code = 1;
      ret.message = JSON.stringify(error);
      return ret;
    }
  },
};
