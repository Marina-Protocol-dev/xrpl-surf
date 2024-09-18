/* eslint-disable max-len */
import { Request } from "express";
import MPLogger from "../util/logger";

/**
 * Stringified UUIDv4.
 * See [RFC 4112](https://tools.ietf.org/html/rfc4122)
 * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
 * @format uuid
 */
export type UUID = string;

export interface FirebaeQueryParam {
  limit?: number;
  next?: string;
  orderBy?: string;
}

export interface ExtPayload {
  platform: string;
  target: string;
}

export interface UserPayload {
  platform: string;
  userAppId: string;
  snuId: string;
}

export interface MPRequest extends Request {
  logger: MPLogger;
  user: UserInfo;
  files?: any;
}

export interface UserInfo {
  uid: string;
  userId: string;
  nickname: string;
  version: string;
  pushToken?: string;
  lastResetDate?: string;
  role?: string;
  ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
}
