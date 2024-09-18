import "reflect-metadata";
import admin from "firebase-admin";

admin.initializeApp();

import { xrpl_v1 } from "./xrpl";

exports.xrpl_v1 = xrpl_v1;
