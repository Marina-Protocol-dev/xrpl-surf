import { ValidateError } from "tsoa";
// import { _REGION_ } from "../constants/constants";
import cors from "cors";

import express, {
  json,
  urlencoded,
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
  Express,
} from "express";

const baseApp = (
  registerRouter: (app: express.Router) => void,
  middleware?: any
): Express => {
  const app = express();

  // Use body parser to read sent json payloads
  app.use(cors()).use(
    urlencoded({
      extended: true,
    })
  );
  app.use(json());

  if (middleware) {
    app.use(middleware);
  }

  registerRouter(app);

  // 404 error handler
  app.use(function notFoundHandler(_req: ExRequest, res: ExResponse) {
    res.status(404).send({
      message: "Not Found",
    });
  });

  // common error handler
  app.use(function errorHandler(
    err: unknown,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction
  ): ExResponse | void {
    if (err instanceof ValidateError) {
      console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
      return res.status(422).json({
        message: "Validation Failed",
        details: err?.fields,
      });
    }
    if (err instanceof Error) {
      // console.log(err);
      const e: any = err;
      const status = e["status"] ? Number(e["status"]) : 500;
      return res.status(status).json({
        result: false,
        error: status.toString(),
        message: err["message"] || "Internal Server Error",
      });
    }

    next();
  });

  return app;
};

export default baseApp;
