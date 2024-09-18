import { Client, Wallet, Payment, isValidAddress } from "xrpl";
import { MPRequest, UserInfo } from "../../../common/types/common";
import { ExchangeDto } from "./exchange.entity";
import MPLogger from "../../../common/util/logger";
import { BooleanResponse } from "../../../common/model/response.model";
import FirestoreService, { FirestoreFieldValue } from "../../../db/firestore";
import { COLLECTIONS } from "../../../db/schema";

const ExchangeService = {
  async exchangePSurfToSurf(
    dto: ExchangeDto,
    request: MPRequest
  ): Promise<BooleanResponse> {
    const logger: MPLogger = request.logger;
    const userInfo: UserInfo = request.user;

    logger.setParams(dto);

    const client = new Client(process.env.RIPPLE_NET!);
    await client.connect();

    try {
      const userDoc = await userInfo.ref.get();
      const { psurf } = userDoc.data()!;

      const { amount, walletAddress } = dto;

      // 1. Check user's pSurf balance
      if (psurf < amount) {
        logger.error("ME1100 - Insufficient balance.");
        return {
          result: false,
          error: "ME1100",
          message: "Insufficient balance.",
        };
      }

      // 2. Verify wallet address validity
      if (!isValidAddress(walletAddress)) {
        logger.error("ME1101 - Invalid wallet address.");
        return {
          result: false,
          error: "ME1101",
          message: "Invalid wallet address.",
        };
      }

      // 3. Check the SURF token balance of the hot wallet
      const hotWallet = Wallet.fromSeed(process.env.HOT_WALLET_SEED!);
      const hotWalletBalance = await client.getBalances(hotWallet.address);
      const surfBalance = hotWalletBalance.find(
        (b) => b.currency === process.env.SURF
      );

      if (!surfBalance || Number(surfBalance.value) < amount) {
        logger.error("ME1102 - Insufficient SURF tokens in the hot wallet.");
        return {
          result: false,
          error: "ME1102",
          message: "Insufficient SURF tokens in the hot wallet.",
        };
      }

      // 4. Transfer SURF tokens and deduct pSurf
      const paymentTx: Payment = {
        TransactionType: "Payment",
        Account: hotWallet.address,
        Destination: walletAddress,
        Amount: {
          currency: process.env.SURF!,
          issuer: hotWallet.address,
          value: amount.toString(),
        },
      };

      const paymentResult = await client.submitAndWait(paymentTx, {
        wallet: hotWallet,
      });

      if (
        typeof paymentResult.result.meta === "string" ||
        paymentResult.result.meta?.TransactionResult !== "tesSUCCESS"
      ) {
        logger.error("ME1103 - Token transfer failed.");
        return {
          result: false,
          error: "ME1103",
          message: "Token transfer failed.",
        };
      }

      let txRet = false;

      try {
        txRet = await FirestoreService.db.runTransaction(async (tx) => {
          // 5. Decrease the user's surf points by the amount that was transferred.
          tx.update(userInfo.ref, {
            psurf: psurf - amount,
            updatedAt: FirestoreFieldValue.serverTimestamp(),
          });

          // 6. Record the surf exchange details.
          tx.create(FirestoreService.db.collection(COLLECTIONS.EVENT).doc(), {
            type: "exchange",
            userId: userInfo.userId,
            status: "3",
            exchange: {
              amount,
              beforSurf: psurf,
            },
            createdAt: FirestoreFieldValue.serverTimestamp(),
            updatedAt: FirestoreFieldValue.serverTimestamp(),
          });

          return true;
        });
      } catch (err: any) {
        logger.error(err.toString());
        txRet = false;
      }

      if (!txRet) {
        return {
          result: false,
          error: "ME500",
          message: "Internal Server Error",
        };
      }

      return { result: true };
    } catch (err: any) {
      logger.error(err.toString());
      return {
        result: false,
        error: "ME500",
        message: "Internal Server Error",
      };
    } finally {
      await client.disconnect();
    }
  },
};

export default ExchangeService;
