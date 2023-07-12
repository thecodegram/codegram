import {Schema} from 'mongoose'

export const vjudgeStatsSchema = new Schema({
    acRecords: {
        type: {
            AtCoder: {
                type: [String],
                required: false
            },
            CSES: {
                type: [String],
                required: false
            },
            CodeChef: {
                type: [String],
                required: false
            },
            CodeForces: {
                type: [String],
                required: false
            },
            DMOJ: {
                type: [String],
                required: false
            },
            EOlymp: {
                type: [String],
                required: false
            },
            Gym: {
                type: [String],
                required: false
            },
            Kattis: {
                type: [String],
                required: false
            },
            SPOJ: {
                type: [String],
                required: false
            },
            TopCoder: {
                type: [String],
                required: false
            },
            UVA: {
                type: [String],
                required: false
            }
        },
        required: false
    },
    failRecords: {
        type: {
            AtCoder: {
                type: [String],
                required: false
            },
            CSES: {
                type: [String],
                required: false
            },
            CodeChef: {
                type: [String],
                required: false
            },
            CodeForces: {
                type: [String],
                required: false
            },
            DMOJ: {
                type: [String],
                required: false
            },
            EOlymp: {
                type: [String],
                required: false
            },
            Gym: {
                type: [String],
                required: false
            },
            Kattis: {
                type: [String],
                required: false
            },
            SPOJ: {
                type: [String],
                required: false
            },
            TopCoder: {
                type: [String],
                required: false
            },
            UVA: {
                type: [String],
                required: false
            }
        },
        required: false
    },
})