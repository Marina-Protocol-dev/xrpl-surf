// src/users/usersController.ts
import { Body, Controller, Post, Route, Security, Request, Tags } from "tsoa";
import { BooleanResponse } from "../../../common/model/response.model";
import ExchangeService from "./exchange.service";
import { MPRequest } from "../../../common/types/common";
import { ExchangeDto } from "./exchange.entity";

@Route("exchanges")
@Tags("Exchange")
export class ExchangeController extends Controller {
  /**
   * Request to issue new surf tokens from cold wallet to hot wallet
   *
   * @param request - express request object
   * @param dto -
   * @returns
   */
  @Post("issue")
  @Security("admin_auth", ["level3"])
  public async issue(
    @Request() request: MPRequest,
    @Body() dto: ExchangeDto
  ): Promise<BooleanResponse> {
    return ExchangeService.exchangePSurfToSurf(dto, request);
  }
}
