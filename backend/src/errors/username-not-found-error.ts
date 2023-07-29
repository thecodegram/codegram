export class UserNameNotFoundError extends Error {
  constructor(userName: String, platform: String) {
    const message = `Username "${userName}" not found in ${platform}`;
    super(message);
    this.name = "UserNameNotFoundError";
  }
}
