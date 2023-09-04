import { UpdateEventData } from "../../model/UpdateEventData";
import { IUpdatesCollectorService } from "./IUpdatesCollectorService";
import { leetcodeUpdatesCollectorService } from "./LeetcodeUpdatesCollectorService";
import { vjudgeUpdatesCollectorService } from "./VjudgeUpdatesCollectorService";

export class AllUpdatesCollectorService implements IUpdatesCollectorService {
    getPlatformName(): string {
        return "ALL";
    }
    async getAndStoreUpdates(userId: string): Promise<UpdateEventData[]> {
        const updatesCollectorServices = [leetcodeUpdatesCollectorService, vjudgeUpdatesCollectorService];

        var allUpdates: UpdateEventData[] = [];
        Promise.all(updatesCollectorServices.map(async service => {
            const updates = await service.getAndStoreUpdates(userId);
            updates.forEach(u => allUpdates.push(u));
        }))

        return allUpdates;
    }
}

export const allUpdatesCollectorService = new AllUpdatesCollectorService();