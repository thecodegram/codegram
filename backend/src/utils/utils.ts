export const validUsername: RegExp = /^[a-zA-Z0-9._-]+$/

export const isValidUsername = (username: String) => validUsername.test(username?.toString())

