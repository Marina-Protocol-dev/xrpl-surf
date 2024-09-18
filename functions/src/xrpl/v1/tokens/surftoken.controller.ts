// src/users/usersController.ts
import { Body, Controller, Post, Route, Security, Request, Tags } from "tsoa";
import { BooleanResponse } from "../../../common/model/response.model";
import SurfTokenService from "./surftoken.service";
import { MPRequest } from "../../../common/types/common";
import { SurfTokenDto } from "./surftoken.entity";

@Route("surftokens")
@Tags("SurfToken")
export class SurfTokenController extends Controller {
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
    @Body() dto: SurfTokenDto
  ): Promise<BooleanResponse> {
    return SurfTokenService.issue(dto, request);
  }
}
