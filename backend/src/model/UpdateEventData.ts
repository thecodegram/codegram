export interface UpdateEventData {
    username: string;
    platform: string;
    problemTitle: string;
    problemTitleSlug: string; // for "Three sum" titleSlug is "three-sum", needed to craft problem url
    timestamp: number;
}