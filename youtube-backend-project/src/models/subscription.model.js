import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscription: {
        type: Schema.type.objectId, // one who is subcribing
        ref: "User",
    },
    channel: {
        type: Schema.type.objectId, // one to whom 'subcriber' is subscribing
        ref: "User",
    }
}, {timestamps: true})

export const subscription = mongoose.model("Subscription",subscriptionSchema)