import mongoose from 'mongoose';

export const TASK_STATUSES = ['pending', 'running', 'success', 'failed'];
export const TASK_OPERATIONS = ['uppercase', 'lowercase', 'reverse', 'word_count'];

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    input: {
      type: String,
      required: true
    },
    operation: {
      type: String,
      required: true,
      enum: TASK_OPERATIONS
    },
    status: {
      type: String,
      required: true,
      enum: TASK_STATUSES,
      default: 'pending',
      index: true
    },
    result: {
      type: String,
      default: null
    },
    logs: {
      type: [String],
      default: []
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;

