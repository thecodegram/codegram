export const validUsername: RegExp = /^[a-zA-Z0-9_-]+$/

export const isValidUsername = (username: string) => validUsername.test(username)

