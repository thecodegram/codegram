export class UserNameNotFoundError extends Error {
    constructor(userName: String) {
      const message = `Username "${userName}" not found.`;
      super(message);
      this.name = 'UserNameNotFoundError';
    }
}