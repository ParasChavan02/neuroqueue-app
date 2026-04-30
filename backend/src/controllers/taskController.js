import { createTask, getTaskById, listTasks, rerunTask } from '../services/taskService.js';

export const create = async (req, res, next) => {
  try {
    const task = await createTask(req.user.id, req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const tasks = await listTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const task = await getTaskById(req.user.id, req.params.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const run = async (req, res, next) => {
  try {
    const task = await rerunTask(req.user.id, req.params.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

