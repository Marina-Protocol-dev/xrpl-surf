import * as functions from "firebase-functions/v1";
import { _REGION_ } from "../common/constants/constants";
import v1 from "./v1";

export const xrpl_v1 = functions
  .runWith({
    timeoutSeconds: 120,
    minInstances: 1,
  })
  .region(_REGION_)
  .https.onRequest(v1);
