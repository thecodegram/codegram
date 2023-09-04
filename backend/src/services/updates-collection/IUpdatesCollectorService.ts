import { UpdateEventData } from "../../model/UpdateEventData";

export interface IUpdatesCollectorService {
    getPlatformName(): string;
    getAndStoreUpdates(userId: string): Promise<UpdateEventData[]>;
}
