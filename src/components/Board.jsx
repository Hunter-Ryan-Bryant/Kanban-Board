import { useState } from "react";
import { COLUMNS } from "../lib/constants";
import { styles } from "../styles";
import TaskCard from "./TaskCard";

export default function Board({
  tasks,
  memberMap,
  labelMap,
  taskLabelsMap,
  hasActiveFilters,
  onOpenTask,
  onDeleteTask,
  onMoveTask,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  function handleDragStart(e, taskId) {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  }

  function handleDrop(e, status) {
    e.preventDefault();
    const taskId = draggedTaskId;
    setDraggedTaskId(null);
    if (taskId) onMoveTask(taskId, status);
  }

  return (
    <div style={styles.board}>
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            style={styles.column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div style={styles.columnHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ ...styles.dot, backgroundColor: col.color }} />
                <h3 style={styles.columnTitle}>{col.label}</h3>
              </div>
              <span style={styles.taskCount}>{columnTasks.length}</span>
            </div>

            <div style={styles.taskList}>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assignee={task.assignee_id ? memberMap[task.assignee_id] : null}
                  labels={(taskLabelsMap[task.id] || [])
                    .map((id) => labelMap[id])
                    .filter(Boolean)}
                  onOpen={() => onOpenTask(task)}
                  onDelete={() => onDeleteTask(task)}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                />
              ))}
              {columnTasks.length === 0 && (
                <div style={styles.emptyColumn}>
                  {hasActiveFilters ? "No matching tasks" : "Drop tasks here"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
