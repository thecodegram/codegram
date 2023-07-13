import {Schema} from 'mongoose'

export const vjudgeStatsSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    acRecords: {
        type: {
            AtCoder: [String],
            CSES: [String],
            CodeChef: [String],
            CodeForces: [String],
            DMOJ: [String],
            EOlymp: [String],
            Gym: [String],
            Kattis: [String],
            SPOJ: [String],
            TopCoder: [String],
            UVA: [String]
        }
    },
    failRecords: {
        type: {
            AtCoder: [String],
            CSES: [String],
            CodeChef: [String],
            CodeForces: [String],
            DMOJ: [String],
            EOlymp: [String],
            Gym: [String],
            Kattis: [String],
            SPOJ: [String],
            TopCoder: [String],
            UVA: [String]
        },
    },
})