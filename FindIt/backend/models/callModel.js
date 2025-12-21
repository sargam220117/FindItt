import mongoose from 'mongoose';

const callSchema = mongoose.Schema(
    {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        callee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        callType: {
            type: String,
            enum: ['audio', 'video'],
            required: true,
        },
        status: {
            type: String,
            enum: ['initiated', 'ringing', 'connected', 'completed', 'rejected', 'missed', 'failed'],
            default: 'initiated',
        },
        duration: {
            type: Number,
            default: 0,
        },
        startedAt: {
            type: Date,
        },
        endedAt: {
            type: Date,
        },
        responseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Response',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

callSchema.index({ caller: 1, callee: 1, createdAt: -1 });
callSchema.index({ responseId: 1, createdAt: -1 });

const Call = mongoose.model('Call', callSchema);

export default Call;
