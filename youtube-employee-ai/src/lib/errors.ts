export class AppError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** ビジネスルール違反(usecase/domain層)。 */
export class DomainError extends AppError {}

/** 入力値・外部応答の形式検証失敗(zod等)。 */
export class ValidationError extends AppError {}

/** 外部API呼び出しの失敗。statusCodeが取れる場合は保持する。 */
export class ExternalApiError extends AppError {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number, options?: ErrorOptions) {
    super(message, options);
    this.statusCode = statusCode;
  }
}

/** 401等、トークン失効を示す外部APIエラー。 */
export class AuthExpiredError extends ExternalApiError {}

/** 429等、レート制限/クォータ超過を示す外部APIエラー。 */
export class QuotaExceededError extends ExternalApiError {}

/** fetchのResponseからステータス別に適切なExternalApiErrorサブクラスを生成する。 */
export async function toExternalApiError(
  response: Response,
  context: string,
): Promise<ExternalApiError> {
  const body = await response.text();
  const message = `${context}: ${response.status} ${body}`;

  if (response.status === 401) {
    return new AuthExpiredError(message, response.status);
  }
  if (response.status === 429) {
    return new QuotaExceededError(message, response.status);
  }
  return new ExternalApiError(message, response.status);
}
