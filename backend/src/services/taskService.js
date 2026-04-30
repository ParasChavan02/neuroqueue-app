import mongoose from 'mongoose';
import { z } from 'zod';

import Task, { TASK_OPERATIONS } from '../models/Task.js';
import { enqueueTask } from './taskQueueService.js';

const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  input: z.string().min(1).max(5000),
  operation: z.enum(TASK_OPERATIONS)
});

export const createTask = async (userId, payload) => {
  const parsed = taskCreateSchema.parse(payload);
  const task = await Task.create({
    userId,
    title: parsed.title,
    input: parsed.input,
    operation: parsed.operation,
    status: 'pending',
    logs: ['Task created and queued']
  });

  try {
    await enqueueTask(task._id.toString());
  } catch (error) {
    task.status = 'failed';
    task.logs.push('Failed to enqueue task');
    await task.save();
    error.statusCode = 503;
    error.message = 'Task could not be queued';
    throw error;
  }

  return task;
};

export const listTasks = async (userId) => Task.find({ userId }).sort({ createdAt: -1 });

export const getTaskById = async (userId, taskId) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error('Invalid task id');
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return task;
};

export const rerunTask = async (userId, taskId) => {
  const task = await getTaskById(userId, taskId);
  task.status = 'pending';
  task.result = null;
  task.attempts = 0;
  task.logs.push('Task re-queued by user');
  await task.save();

  try {
    await enqueueTask(task._id.toString());
  } catch (error) {
    task.status = 'failed';
    task.logs.push('Failed to re-enqueue task');
    await task.save();
    error.statusCode = 503;
    error.message = 'Task could not be re-queued';
    throw error;
  }

  return task;
};
