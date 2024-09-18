import baseApp from "../../common/server/base";
import { loggerMiddleware } from "../../common/server/middleware";
import { RegisterRoutes } from "./routes";

const app = baseApp(RegisterRoutes, loggerMiddleware); // appCheckVerification

export default app;
