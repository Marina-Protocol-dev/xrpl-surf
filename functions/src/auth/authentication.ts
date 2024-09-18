/* eslint-disable @typescript-eslint/no-unused-vars */
// import express from "express";
import admin from "firebase-admin";
import FirestoreService from "../db/firestore";
import MPLogger from "../common/util/logger";
import { COLLECTIONS } from "../db/schema";
import { MPRequest } from "../common/types/common";

export function expressAuthentication(
  request: MPRequest,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  const logger: MPLogger = request.logger;
  if (securityName === "fire_auth") {
    const bearerHeader = (request.headers["authorization"] || "").toString();
    const token = bearerHeader.indexOf(" ") ? bearerHeader.split(" ")[1] : "";
    return new Promise((resolve, reject) => {
      try {
        if (!token) {
          logger.error("No token provided");
          // console.error("[ERROR] AUTH : No token provided");
          reject(new Error("No token provided"));
        }

        admin
          .auth()
          .verifyIdToken(token)
          .then(async (decodedToken) => {
            const uid = decodedToken.uid;
            // 11 등 : Y8kt8hTOW3b6kWVzvyfq0mDHMEx1
            // o9bmAVgQHpTuSZmcn96xUyrMaV63

            logger.setUid(uid);

            const doc = await FirestoreService.collection(COLLECTIONS.USER)
              .doc(uid)
              .get();

            if (!doc || !doc.exists) {
              resolve(decodedToken);
              return;
            }

            const data = doc.data();

            if (!data) {
              resolve(decodedToken);
              return;
            }

            const { withdrawal, version, lastResetDate, nickname, pushToken } =
              data;

            if (withdrawal === true) {
              // console.error("[ERROR] AUTH : withdrawal user");
              logger.error("withdrawal user");
              reject(new Error("withdrawal user."));
            }

            resolve({
              ...decodedToken,
              userId: doc.id,
              nickname,
              pushToken,
              version,
              lastResetDate,
              ref: doc.ref,
            });
          })
          .catch((err) => {
            logger.error("server error : " + err.toString());
            reject(new Error("Invalid authentication information."));
          });
      } catch (err: any) {
        // console.error("[ERROR] AUTH : ", err);
        logger.error("server error : " + err.toString());
        reject(new Error("No token provided"));
      }
    });
  } else if (securityName == "admin_auth") {
    const bearerHeader = (request.headers["authorization"] || "").toString();
    const token = bearerHeader.indexOf(" ") ? bearerHeader.split(" ")[1] : "";
    return new Promise((resolve, reject) => {
      try {
        // const clientIp = requestIp.getClientIp(request);
        // console.log(clientIp);

        if (!token) {
          logger.error("No token provided");
          reject(new Error("No token provided"));
        }

        admin
          .auth()
          .verifyIdToken(token)
          .then(async (decodedToken) => {
            const uid = decodedToken.uid;

            logger.setUid(uid);

            const doc = await FirestoreService.collection("users")
              .doc(uid)
              .get();

            if (!doc || !doc.exists) {
              resolve(decodedToken);
              return;
            }

            const data = doc.data();
            if (!data) {
              resolve(decodedToken);
              return;
            }

            const { nickname, email, role, lastResetDate } = data;

            if (scopes && scopes.length > 0 && scopes.indexOf(role) < 0) {
              reject(new Error("Unauthorized."));
              return;
            }

            resolve({
              ...decodedToken,
              userId: doc.id,
              nickname,
              email,
              role,
              lastResetDate,
              ref: doc.ref,
            });
          })
          .catch((err) => {
            logger.error("server error : " + err.toString());
            reject(new Error("Invalid authentication information."));
          });
      } catch (err: any) {
        logger.error("server error : " + err.toString());
        reject(new Error("No token provided"));
      }
    });
  }

  return Promise.reject({});
}
