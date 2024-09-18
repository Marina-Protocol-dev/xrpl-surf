/**
 * 목록형 데이터 조회시 기본 쿼리
 */
export interface BaseParam {
  /** 한번 조회시 요청 데이터 건 수 */
  perPage?: number;

  /** 다음 페이지 데이터를 요청할 경우 커서 아이디 */
  next?: string;

  /** 이전 페이지 데이터를 요청할 경우 커서 아이디 */
  prev?: string;

  /** 정렬 */
  sort?: string;
}

export interface DeviceParam extends BaseParam {
  /** 장비 유형 */
  type?: string;

  /** 장비 상태 */
  status?: string;
}

export interface ExtApiResult {
  message?: string;
  code?: number;
  response?: any;
}
