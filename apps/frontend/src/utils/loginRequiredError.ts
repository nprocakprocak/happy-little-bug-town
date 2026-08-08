export class LoginRequiredError extends Error {
  code = "LOGIN_REQUIRED";

  constructor(message = "Login required to save progress for this account.") {
    super(message);
    this.name = "LoginRequiredError";
  }
}
