export class UserNameNotFoundError extends Error {
  constructor(userName: String|string|undefined, platform: String) {
    const message = `Username "${userName}" not found in ${platform}`;
    super(message);
    this.name = "UserNameNotFoundError";
  }
}
