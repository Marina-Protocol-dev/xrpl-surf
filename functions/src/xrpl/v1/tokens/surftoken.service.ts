import { BooleanResponse } from "../../../common/model/response.model";
import { MPRequest } from "../../../common/types/common";
import MPLogger from "../../../common/util/logger";
import { SurfTokenDto } from "./surftoken.entity";
import { Client, Wallet, TrustSet, Payment } from "xrpl";

const SurfTokenService = {
  async issue(dto: SurfTokenDto, request: MPRequest): Promise<BooleanResponse> {
    const logger: MPLogger = request.logger;
    logger.setParams(dto);

    const client = new Client(process.env.RIPPLE_NET!);
    await client.connect();

    try {
      const coldWallet = Wallet.fromSeed(process.env.COLD_WALLET_SEED!);
      if (!coldWallet.verifyTransaction(dto.signedTransaction)) {
        throw new Error("The signed transaction is not valid.");
      }

      const hotWallet = Wallet.fromSeed(process.env.HOT_WALLET_SEED!);

      const trustSetTx: TrustSet = {
        TransactionType: "TrustSet",
        Account: hotWallet.address,
        LimitAmount: {
          currency: process.env.SURF!,
          issuer: coldWallet.address,
          value: dto.amount.toString(),
        },
      };

      const trustSetResult = await client.submitAndWait(trustSetTx, {
        wallet: hotWallet,
      });

      if (
        typeof trustSetResult.result.meta == "string" ||
        trustSetResult.result.meta?.TransactionResult !== "tesSUCCESS"
      ) {
        throw new Error("TrustSet transaction failed");
      }

      const paymentTx: Payment = {
        TransactionType: "Payment",
        Account: coldWallet.address,
        Destination: hotWallet.address,
        Amount: {
          currency: process.env.SURF!,
          issuer: coldWallet.address,
          value: dto.amount.toString(),
        },
      };

      const paymentResult = await client.submitAndWait(paymentTx, {
        wallet: coldWallet,
      });

      if (
        typeof paymentResult.result.meta == "string" ||
        paymentResult.result.meta?.TransactionResult !== "tesSUCCESS"
      ) {
        throw new Error("Payment transaction failed");
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

export default SurfTokenService;
