export interface EventModel {
    eventId: number,
    submitterId: number,
    platform: string,
    username: string,
    problemTitle: string,
    problemTitleSlug: string,
    timestamp: number,
    likes: number,
    likedByCurrentUser?: boolean|undefined
}