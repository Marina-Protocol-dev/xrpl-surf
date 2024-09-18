import { Response } from "express";
import admin from "firebase-admin";
import MPLogger from "../util/logger";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import busboy from "busboy";
import { MPRequest } from "../types/common";

export const loggerMiddleware = async (
  req: MPRequest,
  res: Response,
  next: any
) => {
  const logger = new MPLogger({ path: req.path });
  req.logger = logger;

  next();
};

export const appCheckVerification = async (
  req: MPRequest,
  res: Response,
  next: any
) => {
  const logger = new MPLogger({ path: req.path });
  req.logger = logger;

  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken) {
    logger.error("appCheckToken is empty");

    // console.error("[ERROR] AppCheck : appCheckToken is empty");
    res.status(401);
    return next("Unauthorized");
  }

  try {
    const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken);

    if (!appCheckClaims) {
      logger.error("appCheckToken is invalid : " + appCheckToken);
      // console.error(
      //   "[ERROR] AppCheck : appCheckToken is invalid : " + appCheckToken
      // );
      res.status(401);
      return next("Unauthorized");
    }

    return next();
  } catch (err: any) {
    // console.error("[ERROR] AppCheck : " + err);
    logger.error("server error : " + err);
    res.status(401);
    return next("Unauthorized");
  }
};

export const fileParser = (req: any, res: any, next: any) => {
  try {
    const bb = busboy({ headers: req.headers });

    // 데이터를 담을 placeholder
    const files: any = {};
    req.body = {};

    bb.on("error", (err) => {
      // Send this error along to the global error handler
      // console.log(err);
      next(err);
    });

    // 필드 처리
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bb.on("field", (name, val, info) => {
      req.body[name] = val;
    });

    // 파일 처리
    bb.on("file", (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      files[filename] = {
        filename,
        encoding,
        mimeType,
      };

      file.on("data", (data) => {
        files[filename].buffer = Buffer.from(data);
      });
    });

    bb.on("close", () => {
      req.files = files;
      next();
    });

    // The raw bytes of the upload will be in req.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    bb.end(req.rawBody);
  } catch (err: any) {
    next(err);
  }
};
