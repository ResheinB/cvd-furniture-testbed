// src/components/ui/TaskManager.js
import React, { useState } from 'react';

const TaskManager = ({ currentTask, onTaskComplete }) => {
  const [taskStarted, setTaskStarted] = useState(false);
  const [taskTime, setTaskTime] = useState(0);

  const startTask = () => {
    setTaskStarted(true);
    setTaskTime(0);
    // Start timer logic here
  };

  const completeTask = () => {
    const result = {
      taskId: 'task_1',
      completionTime: taskTime,
      success: true,
      timestamp: new Date().toISOString()
    };
    onTaskComplete(result);
    setTaskStarted(false);
  };

  return (
    <div className="task-manager">
      <h3>Task Manager</h3>
      {!taskStarted ? (
        <div>
          <p>Click start to begin the task</p>
          <button onClick={startTask}>Start Task</button>
        </div>
      ) : (
        <div>
          <p>Task in progress... Time: {taskTime}s</p>
          <button onClick={completeTask}>Complete Task</button>
        </div>
      )}
    </div>
  );
};

export default TaskManager;