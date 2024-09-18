export interface ValidateErrorJSON {
  /**
   * @minLength 2
   */
  message: "Validation failed";

  details: { [name: string]: unknown };
}

export interface ErrorResponseModel {
  status: number;

  /**
   * @minLength 2
   */
  message: string;

  /**
   * @ignore
   */
  hidden?: string;
}

export class PaginationData<T> {
  public datas?: T[];
  public next?: string;
  public prev?: string;
  public result!: boolean;
  public error?: string;
  public message?: string;
  public totalCount?: number;
}

export class RewardUserPaginationData<T> {
  public datas?: T[];
  public next?: string;
  public prev?: string;
  public result!: boolean;
  public error?: string;
  public message?: string;
  public totalCount?: number;
  public receivedCount?: number;
}

export class BaseResponse<T> {
  error!: string;
  message?: string;
  data?: T;
}

export interface BooleanResponse {
  result: boolean;
  error?: string;
  message?: string;
}

export interface DataResponse<T> {
  result: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse extends BooleanResponse {
  userId?: string;
  pinCode?: string;
  referralCode?: string;
  referralFlag?: boolean;
  nickname?: string;
  notification?: boolean;
  avatar?: string;
  uniqueId?: string;
  role?: string;
  email?: string;
}
