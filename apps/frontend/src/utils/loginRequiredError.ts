export class LoginRequiredError extends Error {
  readonly code = "LOGIN_REQUIRED" as const;

  constructor(message = "Login required to save progress for this account.") {
    super(message);
    this.name = "LoginRequiredError";
  }
}
