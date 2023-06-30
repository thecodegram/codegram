const userIds = new Set<string>();

export const getUserIDs = () => userIds;
export const addUserID = (userID: string) => userIds.add(userID);