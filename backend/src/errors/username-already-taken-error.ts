export class UsernameAlreadyTakenError extends Error {
    constructor(userName: String|string|undefined, platform: String) {
      const message = `Username "${userName}" is already taken for ${platform}`;
      super(message);
      this.name = "UsernameAlreadyTakenError";
    }
  }
  