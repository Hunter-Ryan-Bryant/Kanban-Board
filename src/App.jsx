import { useState } from "react";
import Board from "./components/Board";
import Header from "./components/Header";
import LabelsModal from "./components/LabelsModal";
import NewTaskModal from "./components/NewTaskModal";
import TaskDrawer from "./components/TaskDrawer";
import TeamModal from "./components/TeamModal";
import Toast from "./components/Toast";
import Toolbar from "./components/Toolbar";
import { useTaskDetail } from "./hooks/useTaskDetail";
import { useTaskFilters } from "./hooks/useTaskFilters";
import { useToast } from "./hooks/useToast";
import { useWorkspace } from "./hooks/useWorkspace";
import { cx } from "./lib/utils";
import css from "./App.module.css";
import ui from "./components/ui.module.css";

export default function App() {
  const toast = useToast();
  const workspace = useWorkspace(toast.notify);
  const detail = useTaskDetail(workspace, toast.notify);
  const filters = useTaskFilters(workspace.tasks, workspace.taskLabelsMap);
  // "labels" | "team" | "newTask" | null
  const [openModal, setOpenModal] = useState(null);
  const closeModal = () => setOpenModal(null);

  function handleDeleteTask(task) {
    if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
      workspace.deleteTask(task);
    }
  }

  if (workspace.loadError) {
    return (
      <div role="alert" className={css.screen}>
        <p className={css.errorText}>{workspace.loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cx(ui.primaryButton, css.retryButton)}
        >
          Try again
        </button>
      </div>
    );
  }

  if (workspace.loading) {
    return (
      <div role="status" className={css.screen}>
        <div aria-hidden="true" className={css.spinner}></div>
        <p className={css.loadingText}>Loading workspace...</p>
      </div>
    );
  }

  return (
    <main className={css.app}>
      <Header
        tasks={workspace.tasks}
        realtimeStatus={workspace.realtimeStatus}
        labelCount={workspace.labels.length}
        memberCount={workspace.teamMembers.length}
        onOpenLabels={() => setOpenModal("labels")}
        onOpenTeam={() => setOpenModal("team")}
        onNewTask={() => setOpenModal("newTask")}
      />

      <Toolbar
        {...filters}
        labels={workspace.labels}
        teamMembers={workspace.teamMembers}
      />

      <Board
        tasks={filters.filteredTasks}
        memberMap={workspace.memberMap}
        labelMap={workspace.labelMap}
        taskLabelsMap={workspace.taskLabelsMap}
        hasActiveFilters={filters.hasActiveFilters}
        onOpenTask={detail.open}
        onDeleteTask={handleDeleteTask}
        onMoveTask={workspace.moveTask}
      />

      {openModal === "labels" && (
        <LabelsModal
          labels={workspace.labels}
          onAdd={workspace.addLabel}
          onDelete={workspace.deleteLabel}
          onClose={closeModal}
        />
      )}

      {openModal === "team" && (
        <TeamModal
          teamMembers={workspace.teamMembers}
          onAdd={workspace.addTeamMember}
          onDelete={workspace.deleteTeamMember}
          onClose={closeModal}
        />
      )}

      {openModal === "newTask" && (
        <NewTaskModal
          labels={workspace.labels}
          teamMembers={workspace.teamMembers}
          onCreate={workspace.createTask}
          onClose={closeModal}
        />
      )}

      {detail.selectedTask && (
        <TaskDrawer
          detail={detail}
          labels={workspace.labels}
          teamMembers={workspace.teamMembers}
          labelIds={workspace.taskLabelsMap[detail.selectedTask.id] || []}
        />
      )}

      <Toast message={toast.message} onDismiss={toast.dismiss} />
    </main>
  );
}
