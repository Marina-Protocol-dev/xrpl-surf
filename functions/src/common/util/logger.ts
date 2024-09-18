import { logger } from "firebase-functions/v1";

export type SEVERITY = "info" | "debug" | "error";

export type MPMethod = {
  name: string;
  params: any;
  result: any;
  error?: string;
  message?: any;
};

class MPLogger {
  private path?: string;
  private uid?: string;
  private params?: any;
  private methods: MPMethod[];

  constructor(options: { path: string; uid?: string; params?: any }) {
    const { path, uid, params } = options;
    this.path = path;
    this.uid = uid || "";
    this.params = params || "";
    this.methods = [];
  }

  setUid(uid: string) {
    this.uid = uid;
  }

  setParams(params: any) {
    this.params = params;
  }

  addMethod(param: MPMethod) {
    this.methods.push(param);
  }

  error(message: any) {
    logger.error(`[ERROR] ${this.log()} ${this.message2String(message)}`);
  }

  debug(message: any) {
    logger.debug(`[DEBUG] ${this.log()} ${this.message2String(message)}`);
  }

  info(message: any) {
    logger.info(`[INFO] ${this.log()} ${this.message2String(message)}`);
  }

  message2String(message: any) {
    if (typeof message == "string") {
      return message;
    } else if (typeof message == "number") {
      return message.toString();
    } else if (typeof message == "object") {
      return JSON.stringify(message);
    }

    return "";
  }

  log() {
    let str = "";
    if (this.uid) {
      str = "uid : " + this.uid + ", ";
    }

    if (this.path) {
      str += "path : " + this.path + ", ";
    }

    if (this.params) {
      str += "params : ";

      if (typeof this.params == "string") {
        str += this.params + ", ";
      } else if (typeof this.params == "number") {
        str += this.params.toString() + ", ";
      } else if (typeof this.params == "object") {
        str += JSON.stringify(this.params) + ", ";
      }
    }

    return str;
  }
}

export default MPLogger;
