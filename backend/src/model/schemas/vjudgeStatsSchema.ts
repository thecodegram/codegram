import {Schema, model} from 'mongoose'

export const vjudgeStatsSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    acRecords: {
        type: {
            AtCoder: {
                type: [String],
                default: []
            },
            CSES: {
                type: [String],
                default: []
            },
            CodeChef: {
                type: [String],
                default: []
            },
            CodeForces: {
                type: [String],
                default: []
            },
            DMOJ: {
                type: [String],
                default: []
            },
            EOlymp: {
                type: [String],
                default: []
            },
            Gym: {
                type: [String],
                default: []
            },
            Kattis: {
                type: [String],
                default: []
            },
            SPOJ: {
                type: [String],
                default: []
            },
            TopCoder: {
                type: [String],
                default: []
            },
            UVA: {
                type: [String],
                default: []
            },
            HDU: {
                type: [String],
                default: []
            },
            HackerRank: {
                type: [String],
                default: []
            },
            LightOJ: {
                type: [String],
                default: []
            },
            SGU: {
                type: [String],
                default: []
            },
            URAL: {
                type: [String],
                default: []
            },
            UVALive: {
                type: [String],
                default: []
            }
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

export const VjudgeStats = model('VjudgeStats', vjudgeStatsSchema);