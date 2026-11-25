import { useId, useState } from "react";
import { COLUMNS } from "../lib/constants";
import css from "./Board.module.css";
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
  const id = useId();

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
    <div className={css.board}>
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        return (
          <section
            key={col.id}
            aria-labelledby={`${id}-${col.id}`}
            className={css.column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={css.columnHeader}>
              <div className={css.columnName}>
                <span
                  aria-hidden="true"
                  className={css.dot}
                  style={{ "--dot": col.color }}
                />
                <h2 id={`${id}-${col.id}`} className={css.columnTitle}>
                  {col.label}
                </h2>
              </div>
              <span className={css.count}>
                {columnTasks.length}
                <span className="sr-only">
                  {columnTasks.length === 1 ? " task" : " tasks"}
                </span>
              </span>
            </div>

            <div className={css.taskList}>
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
                <div className={css.empty}>
                  {hasActiveFilters ? "No matching tasks" : "Drop tasks here"}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
