import axios, { AxiosError } from 'axios'
import { isValidUsername } from '../utils/utils'
import { UserNameNotFoundError } from '../errors/username-not-found-error';
import { ExternalApiError } from '../errors/external-api-error';

export class VjudgeApi {
    async getSubmissionStats(username: string) {
        if (!isValidUsername(username)) throw new Error("Invalid username format");

        try {
            const response = await axios.get(`https://vjudge.net/user/solveDetail/${username}`);
            return response.data;
        } catch (err) {
            if (err instanceof AxiosError) {
                const response = err.response!!;
                if (response.status === 404) throw new UserNameNotFoundError(username, "vjudge");
                else throw new ExternalApiError("vjudge", response.status);
            }
            else throw err;
        }
    }
}

export const vjudgeApi = new VjudgeApi();