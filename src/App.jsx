import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase, getOrCreateGuestSession } from "./supabaseClient";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#64748b" },
  { id: "in_progress", label: "In Progress", color: "#3b82f6" },
  { id: "in_review", label: "In Review", color: "#f59e0b" },
  { id: "done", label: "Done", color: "#10b981" },
];

const AVATAR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];
const LABEL_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getDueDateStatus(dueDateStr, taskStatus) {
  if (!dueDateStr) return null;
  if (taskStatus === "done") {
    return {
      type: "completed",
      label: dueDateStr,
      bg: "#064e3b",
      color: "#6ee7b7",
      border: "#047857",
    };
  }

  const [year, month, day] = dueDateStr.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: "overdue",
      label: `Overdue (${dueDateStr})`,
      bg: "#450a0a",
      color: "#fca5a5",
      border: "#991b1b",
    };
  }
  if (diffDays === 0) {
    return {
      type: "due_soon",
      label: "Due Today",
      bg: "#451a03",
      color: "#fcd34d",
      border: "#b45309",
    };
  }
  if (diffDays <= 2) {
    return {
      type: "due_soon",
      label: `Due in ${diffDays}d`,
      bg: "#451a03",
      color: "#fcd34d",
      border: "#b45309",
    };
  }
  return {
    type: "upcoming",
    label: dueDateStr,
    bg: "#1e293b",
    color: "#94a3b8",
    border: "#334155",
  };
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [taskLabels, setTaskLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");

  // New Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Team Management Modal state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberColor, setMemberColor] = useState(AVATAR_COLORS[0]);

  // Labels Management Modal state
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(LABEL_COLORS[0]);

  // Task Detail Slide-Over Drawer state
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);

  // Error reporting
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  // Tracks which task the drawer is showing, so slow responses for a
  // previously opened task don't overwrite the current one.
  const openTaskIdRef = useRef(null);

  function notify(message) {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  }

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTasks(data || []);
    return error;
  }

  async function fetchTeamMembers() {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setTeamMembers(data || []);
    return error;
  }

  async function fetchLabels() {
    const { data, error } = await supabase
      .from("labels")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setLabels(data || []);
    return error;
  }

  async function fetchTaskLabels() {
    const { data, error } = await supabase.from("task_labels").select("*");
    if (!error) setTaskLabels(data || []);
    return error;
  }

  useEffect(() => {
    async function init() {
      const activeSession = await getOrCreateGuestSession();
      if (!activeSession) {
        setLoadError(
          "Couldn't start a guest session. Check your connection and Supabase configuration.",
        );
        setLoading(false);
        return;
      }
      setSession(activeSession);
      const errors = (
        await Promise.all([
          fetchTasks(),
          fetchTeamMembers(),
          fetchLabels(),
          fetchTaskLabels(),
        ])
      ).filter(Boolean);
      if (errors.length > 0) {
        setLoadError(`Couldn't load your workspace: ${errors[0].message}`);
      }
      setLoading(false);
    }
    init();
  }, []);

  async function handleAddTeamMember(e) {
    e.preventDefault();
    if (!memberName.trim() || !session?.user) return;
    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          name: memberName.trim(),
          role: memberRole.trim() || null,
          avatar_color: memberColor,
          user_id: session.user.id,
        },
      ])
      .select();
    if (error || !data) {
      notify(`Couldn't add team member: ${error?.message ?? "no data returned"}`);
      return;
    }
    setTeamMembers((prev) => [...prev, data[0]]);
    setMemberName("");
    setMemberRole("");
  }

  async function handleDeleteTeamMember(member) {
    if (
      !window.confirm(
        `Remove ${member.name}? Tasks assigned to them will become unassigned.`,
      )
    )
      return;
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", member.id);
    if (error) {
      notify(`Couldn't remove team member: ${error.message}`);
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
    setTasks((prev) =>
      prev.map((t) =>
        t.assignee_id === member.id ? { ...t, assignee_id: null } : t,
      ),
    );
    setSelectedTask((prev) =>
      prev?.assignee_id === member.id ? { ...prev, assignee_id: null } : prev,
    );
  }

  async function handleAddLabel(e) {
    e.preventDefault();
    if (!labelName.trim() || !session?.user) return;
    const { data, error } = await supabase
      .from("labels")
      .insert([
        { name: labelName.trim(), color: labelColor, user_id: session.user.id },
      ])
      .select();
    if (error || !data) {
      notify(`Couldn't add label: ${error?.message ?? "no data returned"}`);
      return;
    }
    setLabels((prev) => [...prev, data[0]]);
    setLabelName("");
  }

  async function handleDeleteLabel(label) {
    if (
      !window.confirm(
        `Delete the "${label.name}" label? It will be removed from every task.`,
      )
    )
      return;
    const { error } = await supabase.from("labels").delete().eq("id", label.id);
    if (error) {
      notify(`Couldn't delete label: ${error.message}`);
      return;
    }
    setLabels((prev) => prev.filter((l) => l.id !== label.id));
    setTaskLabels((prev) => prev.filter((tl) => tl.label_id !== label.id));
  }

  async function openTaskDetail(task) {
    openTaskIdRef.current = task.id;
    setSelectedTask(task);
    setComments([]);
    setActivityLogs([]);
    const [commentsRes, activityRes] = await Promise.all([
      supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("task_activity")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: false }),
    ]);
    if (openTaskIdRef.current !== task.id) return; // user opened another task
    if (commentsRes.error || activityRes.error) {
      notify(
        `Couldn't load task history: ${(commentsRes.error || activityRes.error).message}`,
      );
    }
    setComments(commentsRes.data || []);
    setActivityLogs(activityRes.data || []);
  }

  function closeTaskDetail() {
    openTaskIdRef.current = null;
    setSelectedTask(null);
  }

  async function logActivity(taskId, action, details) {
    if (!session?.user) return;
    // Activity logging is best-effort: a failure here shouldn't undo the
    // change the user just made, so it's only logged to the console.
    const { error } = await supabase
      .from("task_activity")
      .insert([{ task_id: taskId, user_id: session.user.id, action, details }]);
    if (error) {
      console.warn("Failed to log activity:", error.message);
      return;
    }
    if (openTaskIdRef.current === taskId) {
      const { data } = await supabase
        .from("task_activity")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (data && openTaskIdRef.current === taskId) setActivityLogs(data);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    let activeSession = session;
    if (!activeSession?.user) {
      activeSession = await getOrCreateGuestSession();
      if (!activeSession?.user) {
        notify("Couldn't create task: no active session.");
        return;
      }
      setSession(activeSession);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          due_date: dueDate || null,
          assignee_id: assigneeId || null,
          user_id: activeSession.user.id,
        },
      ])
      .select();

    if (error || !data) {
      notify(`Couldn't create task: ${error?.message ?? "no data returned"}`);
      return;
    }

    const newTask = data[0];
    setTasks((prev) => [newTask, ...prev]);

    if (selectedLabels.length > 0) {
      const labelInserts = selectedLabels.map((label_id) => ({
        task_id: newTask.id,
        label_id,
        user_id: activeSession.user.id,
      }));
      const { data: tlData, error: tlError } = await supabase
        .from("task_labels")
        .insert(labelInserts)
        .select();
      if (tlError) {
        notify(`Task created, but labels couldn't be added: ${tlError.message}`);
      } else if (tlData) {
        setTaskLabels((prev) => [...prev, ...tlData]);
      }
    }

    setTitle("");
    setDescription("");
    setPriority("normal");
    setStatus("todo");
    setDueDate("");
    setAssigneeId("");
    setSelectedLabels([]);
    setIsModalOpen(false);
    await logActivity(newTask.id, "created", "Task created in workspace");
  }

  async function handleDeleteTask(task, e) {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      notify(`Couldn't delete task: ${error.message}`);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setTaskLabels((prev) => prev.filter((tl) => tl.task_id !== task.id));
    if (openTaskIdRef.current === task.id) closeTaskDetail();
  }

  async function handleToggleTaskLabel(taskId, labelId) {
    if (!session?.user) return;
    const exists = taskLabels.find(
      (tl) => tl.task_id === taskId && tl.label_id === labelId,
    );
    if (exists) {
      const { error } = await supabase
        .from("task_labels")
        .delete()
        .eq("id", exists.id);
      if (error) {
        notify(`Couldn't remove label: ${error.message}`);
        return;
      }
      setTaskLabels((prev) => prev.filter((tl) => tl.id !== exists.id));
      await logActivity(taskId, "label_removed", "Removed label");
    } else {
      const { data, error } = await supabase
        .from("task_labels")
        .insert([
          { task_id: taskId, label_id: labelId, user_id: session.user.id },
        ])
        .select();
      if (error || !data) {
        notify(`Couldn't add label: ${error?.message ?? "no data returned"}`);
        return;
      }
      setTaskLabels((prev) => [...prev, data[0]]);
      await logActivity(taskId, "label_added", "Added label");
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask || !session?.user) return;
    const taskId = selectedTask.id;
    const { data, error } = await supabase
      .from("task_comments")
      .insert([
        {
          task_id: taskId,
          user_id: session.user.id,
          body: newComment.trim(),
        },
      ])
      .select();
    if (error || !data) {
      notify(`Couldn't post comment: ${error?.message ?? "no data returned"}`);
      return;
    }
    if (openTaskIdRef.current === taskId) {
      setComments((prev) => [...prev, data[0]]);
    }
    setNewComment("");
    await logActivity(taskId, "commented", "Added a comment");
  }

  // Updates the drawer's copy of a field without saving. Used for text
  // inputs so the database is only written once, on blur.
  function handleEditTaskField(field, value) {
    setSelectedTask((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  // Saves a field if it differs from the last saved value. On failure the
  // board and drawer are rolled back to the saved value.
  async function handleSaveTaskField(field, value) {
    if (!selectedTask) return;
    const taskId = selectedTask.id;
    const saved = tasks.find((t) => t.id === taskId);
    if (!saved) return;

    const normalize = (v) => (v === "" || v === undefined ? null : v);
    let dbValue = normalize(value);
    if (field === "title") dbValue = normalize(value.trim());
    const previous = saved[field];

    const apply = (v) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, [field]: v } : t)),
      );
      setSelectedTask((prev) =>
        prev?.id === taskId ? { ...prev, [field]: v } : prev,
      );
    };

    if (field === "title" && dbValue === null) {
      notify("Title can't be empty.");
      apply(previous);
      return;
    }
    if (normalize(previous) === dbValue) {
      apply(previous); // drop any cosmetic difference (e.g. trailing spaces)
      return;
    }

    apply(dbValue);
    const { error } = await supabase
      .from("tasks")
      .update({ [field]: dbValue })
      .eq("id", taskId);
    if (error) {
      apply(previous);
      notify(`Couldn't save ${field.replace("_", " ")}: ${error.message}`);
      return;
    }
    await logActivity(
      taskId,
      "updated",
      `Changed ${field} to "${dbValue ?? "none"}"`,
    );
  }

  function handleDragStart(e, taskId) {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDrop(e, targetStatus) {
    e.preventDefault();
    const taskId = draggedTaskId;
    setDraggedTaskId(null);
    if (!taskId) return;
    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;
    const previousStatus = taskToMove.status;

    const applyStatus = (s) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: s } : t)),
      );
      setSelectedTask((prev) =>
        prev?.id === taskId ? { ...prev, status: s } : prev,
      );
    };

    applyStatus(targetStatus);
    const { error } = await supabase
      .from("tasks")
      .update({ status: targetStatus })
      .eq("id", taskId);
    if (error) {
      applyStatus(previousStatus);
      notify(`Couldn't move task: ${error.message}`);
      return;
    }
    await logActivity(
      taskId,
      "moved_column",
      `Moved from ${previousStatus} to ${targetStatus}`,
    );
  }

  const memberMap = useMemo(() => {
    const map = {};
    teamMembers.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [teamMembers]);

  const labelMap = useMemo(() => {
    const map = {};
    labels.forEach((l) => {
      map[l.id] = l;
    });
    return map;
  }, [labels]);

  const taskLabelsMap = useMemo(() => {
    const map = {};
    taskLabels.forEach((tl) => {
      if (!map[tl.task_id]) map[tl.task_id] = [];
      map[tl.task_id].push(tl.label_id);
    });
    return map;
  }, [taskLabels]);

  const summaryStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) => getDueDateStatus(t.due_date, t.status)?.type === "overdue",
    ).length;
    return { total, completed, overdue };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q));
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const dateStatus = getDueDateStatus(task.due_date, task.status);
      const matchesUrgency =
        urgencyFilter === "all" ||
        (urgencyFilter === "overdue" && dateStatus?.type === "overdue") ||
        (urgencyFilter === "due_soon" && dateStatus?.type === "due_soon");
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" && !task.assignee_id) ||
        task.assignee_id === assigneeFilter;

      const taskLbls = taskLabelsMap[task.id] || [];
      const matchesLabel =
        labelFilter === "all" || taskLbls.includes(labelFilter);

      return (
        matchesSearch &&
        matchesPriority &&
        matchesUrgency &&
        matchesAssignee &&
        matchesLabel
      );
    });
  }, [
    tasks,
    searchQuery,
    priorityFilter,
    urgencyFilter,
    assigneeFilter,
    labelFilter,
    taskLabelsMap,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    priorityFilter !== "all" ||
    urgencyFilter !== "all" ||
    assigneeFilter !== "all" ||
    labelFilter !== "all";

  if (loadError) {
    return (
      <div style={styles.loaderContainer}>
        <p style={{ color: "#fca5a5", maxWidth: "28rem", textAlign: "center" }}>
          {loadError}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ ...styles.primaryButton, marginTop: "1rem" }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#94a3b8", marginTop: "1rem" }}>
          Loading workspace...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>Kanban Workspace</h1>
          <p style={styles.subtitle}>
            Guest Session Active • Custom Tags, Assignments & Audit Logs
          </p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.statsGroup}>
            <div style={styles.statBadge}>
              <span style={styles.statLabel}>Total</span>
              <span style={styles.statValue}>{summaryStats.total}</span>
            </div>
            <div style={styles.statBadge}>
              <span style={styles.statLabel}>Done</span>
              <span style={{ ...styles.statValue, color: "#10b981" }}>
                {summaryStats.completed}
              </span>
            </div>
            <div
              style={{
                ...styles.statBadge,
                borderColor: summaryStats.overdue > 0 ? "#7f1d1d" : "#1e293b",
              }}
            >
              <span style={styles.statLabel}>Overdue</span>
              <span
                style={{
                  ...styles.statValue,
                  color: summaryStats.overdue > 0 ? "#f87171" : "#94a3b8",
                }}
              >
                {summaryStats.overdue}
              </span>
            </div>
          </div>

          <button
            style={styles.secondaryHeaderBtn}
            onClick={() => setIsLabelsModalOpen(true)}
          >
            🏷️ Labels ({labels.length})
          </button>
          <button
            style={styles.secondaryHeaderBtn}
            onClick={() => setIsTeamModalOpen(true)}
          >
            👥 Team ({teamMembers.length})
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            + New Task
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Due Dates</option>
            <option value="overdue">Overdue Only</option>
            <option value="due_soon">Due Today / Soon</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("all");
                setUrgencyFilter("all");
                setAssigneeFilter("all");
                setLabelFilter("all");
              }}
              style={styles.clearButton}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      <div style={styles.board}>
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              style={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div style={styles.columnHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ ...styles.dot, backgroundColor: col.color }} />
                  <h3 style={styles.columnTitle}>{col.label}</h3>
                </div>
                <span style={styles.taskCount}>{columnTasks.length}</span>
              </div>

              <div style={styles.taskList}>
                {columnTasks.map((task) => {
                  const dueInfo = getDueDateStatus(task.due_date, task.status);
                  const assignee = task.assignee_id
                    ? memberMap[task.assignee_id]
                    : null;
                  const taskLblIds = taskLabelsMap[task.id] || [];
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openTaskDetail(task)}
                      style={{
                        ...styles.card,
                        borderLeft:
                          dueInfo?.type === "overdue"
                            ? "3px solid #ef4444"
                            : "1px solid #374151",
                      }}
                    >
                      <div style={styles.cardHeader}>
                        <span
                          style={{
                            ...styles.priorityBadge,
                            backgroundColor:
                              task.priority === "high"
                                ? "#7f1d1d"
                                : task.priority === "low"
                                  ? "#14532d"
                                  : "#334155",
                            color:
                              task.priority === "high"
                                ? "#fca5a5"
                                : task.priority === "low"
                                  ? "#86efac"
                                  : "#cbd5e1",
                          }}
                        >
                          {task.priority}
                        </span>
                        <button
                          onClick={(e) => handleDeleteTask(task, e)}
                          style={styles.deleteBtn}
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>

                      {taskLblIds.length > 0 && (
                        <div style={styles.cardLabelsRow}>
                          {taskLblIds.map((lId) => {
                            const lbl = labelMap[lId];
                            if (!lbl) return null;
                            return (
                              <span
                                key={lId}
                                style={{
                                  ...styles.tagBadge,
                                  backgroundColor: `${lbl.color}25`,
                                  color: lbl.color,
                                  border: `1px solid ${lbl.color}50`,
                                }}
                              >
                                {lbl.name}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <h4 style={styles.cardTitle}>{task.title}</h4>
                      {task.description && (
                        <p style={styles.cardDesc}>{task.description}</p>
                      )}

                      {(dueInfo || assignee) && (
                        <div style={styles.cardFooter}>
                          <div>
                            {dueInfo && (
                              <span
                                style={{
                                  ...styles.dueBadge,
                                  backgroundColor: dueInfo.bg,
                                  color: dueInfo.color,
                                  border: `1px solid ${dueInfo.border}`,
                                }}
                              >
                                📅 {dueInfo.label}
                              </span>
                            )}
                          </div>
                          {assignee && (
                            <div
                              style={{
                                ...styles.avatarBadge,
                                backgroundColor: assignee.avatar_color,
                              }}
                              title={`Assigned to ${assignee.name}`}
                            >
                              {getInitials(assignee.name)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* Labels Management Modal */}
      {isLabelsModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsLabelsModalOpen(false)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Manage Labels</h2>
              <button
                onClick={() => setIsLabelsModalOpen(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleAddLabel}
              style={{ ...styles.form, marginBottom: "1.25rem" }}
            >
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Label Name *</label>
                <input
                  type="text"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  placeholder="e.g., Bug, Feature, Urgent"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setLabelColor(color)}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: color,
                        border:
                          labelColor === color
                            ? "2px solid #ffffff"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                  <button
                    type="submit"
                    style={{
                      ...styles.primaryButton,
                      marginLeft: "auto",
                      padding: "0.45rem 1rem",
                    }}
                  >
                    + Add Label
                  </button>
                </div>
              </div>
            </form>
            <hr style={styles.divider} />
            <div style={styles.memberList}>
              {labels.map((l) => (
                <div key={l.id} style={styles.memberItem}>
                  <span
                    style={{
                      ...styles.tagBadge,
                      backgroundColor: `${l.color}25`,
                      color: l.color,
                      border: `1px solid ${l.color}50`,
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.5rem",
                    }}
                  >
                    {l.name}
                  </span>
                  <button
                    onClick={() => handleDeleteLabel(l)}
                    style={styles.deleteBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
              {labels.length === 0 && (
                <p style={styles.emptyText}>No labels created yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {isTeamModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsTeamModalOpen(false)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Team Members</h2>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleAddTeamMember}
              style={{ ...styles.form, marginBottom: "1.25rem" }}
            >
              <div style={styles.rowGroup}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Alex Rivera"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Role</label>
                  <input
                    type="text"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="Developer"
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Avatar Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setMemberColor(color)}
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: color,
                        border:
                          memberColor === color
                            ? "2px solid #ffffff"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                  <button
                    type="submit"
                    style={{
                      ...styles.primaryButton,
                      marginLeft: "auto",
                      padding: "0.45rem 1rem",
                    }}
                  >
                    + Add Member
                  </button>
                </div>
              </div>
            </form>
            <hr style={styles.divider} />
            <div style={styles.memberList}>
              {teamMembers.map((member) => (
                <div key={member.id} style={styles.memberItem}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        ...styles.avatarBadge,
                        backgroundColor: member.avatar_color,
                        width: "32px",
                        height: "32px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "0.9rem",
                          color: "#f8fafc",
                        }}
                      >
                        {member.name}
                      </div>
                      {member.role && (
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          {member.role}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTeamMember(member)}
                    style={styles.deleteBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p style={styles.emptyText}>No team members added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Slide-Over Drawer */}
      {selectedTask && (
        <div style={styles.drawerOverlay} onClick={closeTaskDetail}>
          <div
            style={styles.drawerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.drawerHeader}>
              <h2 style={styles.drawerHeaderTitle}>Task Details</h2>
              <button
                onClick={closeTaskDetail}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div style={styles.drawerBody}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) =>
                    handleEditTaskField("title", e.target.value)
                  }
                  onBlur={(e) => handleSaveTaskField("title", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={selectedTask.description || ""}
                  onChange={(e) =>
                    handleEditTaskField("description", e.target.value)
                  }
                  onBlur={(e) =>
                    handleSaveTaskField("description", e.target.value)
                  }
                  rows={3}
                  style={styles.textarea}
                />
              </div>

              {/* Labels Toggle Section */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Labels</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {labels.map((l) => {
                    const isAttached = (
                      taskLabelsMap[selectedTask.id] || []
                    ).includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() =>
                          handleToggleTaskLabel(selectedTask.id, l.id)
                        }
                        style={{
                          backgroundColor: isAttached
                            ? `${l.color}35`
                            : "#1f2937",
                          color: isAttached ? l.color : "#94a3b8",
                          border: `1px solid ${isAttached ? l.color : "#374151"}`,
                          padding: "0.25rem 0.625rem",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        {isAttached ? "✓ " : "+ "}
                        {l.name}
                      </button>
                    );
                  })}
                  {labels.length === 0 && (
                    <span style={styles.emptyText}>
                      No labels created yet. Add them via the 🏷️ Labels button.
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.rowGroup}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) =>
                      handleSaveTaskField("status", e.target.value)
                    }
                    style={styles.input}
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) =>
                      handleSaveTaskField("priority", e.target.value)
                    }
                    style={styles.input}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={styles.rowGroup}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Assignee</label>
                  <select
                    value={selectedTask.assignee_id || ""}
                    onChange={(e) =>
                      handleSaveTaskField("assignee_id", e.target.value)
                    }
                    style={styles.input}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.due_date || ""}
                    onChange={(e) =>
                      handleSaveTaskField("due_date", e.target.value)
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <hr style={styles.divider} />
              <div>
                <h3 style={styles.sectionTitle}>
                  Comments ({comments.length})
                </h3>
                <div style={styles.commentsList}>
                  {comments.map((c) => (
                    <div key={c.id} style={styles.commentItem}>
                      <p style={styles.commentBody}>{c.body}</p>
                      <span style={styles.commentDate}>
                        {new Date(c.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p style={styles.emptyText}>No comments yet.</p>
                  )}
                </div>
                <form onSubmit={handleAddComment} style={styles.commentForm}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    style={styles.input}
                  />
                  <button type="submit" style={styles.secondaryButton}>
                    Send
                  </button>
                </form>
              </div>

              <hr style={styles.divider} />
              <div>
                <h3 style={styles.sectionTitle}>Activity Log</h3>
                <div style={styles.activityList}>
                  {activityLogs.map((log) => (
                    <div key={log.id} style={styles.activityItem}>
                      <span style={styles.activityText}>• {log.details}</span>
                      <span style={styles.activityDate}>
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Task</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTask} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={styles.textarea}
                  placeholder="Details..."
                />
              </div>

              {/* Labels Selection */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Labels</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {labels.map((l) => {
                    const isSelected = selectedLabels.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() =>
                          setSelectedLabels(
                            isSelected
                              ? selectedLabels.filter((id) => id !== l.id)
                              : [...selectedLabels, l.id],
                          )
                        }
                        style={{
                          backgroundColor: isSelected
                            ? `${l.color}35`
                            : "#1f2937",
                          color: isSelected ? l.color : "#94a3b8",
                          border: `1px solid ${isSelected ? l.color : "#374151"}`,
                          padding: "0.25rem 0.625rem",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {l.name}
                      </button>
                    );
                  })}
                  {labels.length === 0 && (
                    <span style={styles.emptyText}>
                      No labels available. Create them in the top header.
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.rowGroup}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={styles.input}
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={styles.input}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={styles.rowGroup}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div role="alert" style={styles.toast}>
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            style={styles.toastClose}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  toast: {
    position: "fixed",
    bottom: "1.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    maxWidth: "min(32rem, calc(100vw - 2rem))",
    padding: "0.75rem 1rem",
    backgroundColor: "#450a0a",
    color: "#fecaca",
    border: "1px solid #991b1b",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
    fontSize: "0.875rem",
    zIndex: 1000,
  },
  toastClose: {
    background: "none",
    border: "none",
    color: "inherit",
    fontSize: "1.25rem",
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
  },
  appContainer: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    color: "#f8fafc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "1.75rem 1.5rem",
  },
  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#090d16",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #1e293b",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.25rem",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "1.25rem",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  statsGroup: { display: "flex", alignItems: "center", gap: "0.625rem" },
  statBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    padding: "0.4rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
  },
  statLabel: { color: "#94a3b8", fontWeight: "500" },
  statValue: { color: "#f8fafc", fontWeight: "700", fontSize: "0.9rem" },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  subtitle: { fontSize: "0.875rem", color: "#64748b", margin: "0.25rem 0 0 0" },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  searchWrapper: {
    position: "relative",
    flex: "1 1 280px",
    maxWidth: "420px",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "0.75rem",
    fontSize: "0.85rem",
    pointerEvents: "none",
    opacity: 0.7,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "0.55rem 0.75rem 0.55rem 2.25rem",
    color: "#f8fafc",
    fontSize: "0.875rem",
    outline: "none",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.625rem",
  },
  filterSelect: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "0.55rem 0.75rem",
    color: "#e2e8f0",
    fontSize: "0.85rem",
    cursor: "pointer",
    outline: "none",
  },
  clearButton: {
    backgroundColor: "#1e293b",
    color: "#93c5fd",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.55rem 0.85rem",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryHeaderBtn: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
    padding: "0.625rem 1rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  secondaryButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "0.55rem 1rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.5rem",
    alignItems: "start",
  },
  column: {
    backgroundColor: "#111827",
    borderRadius: "10px",
    border: "1px solid #1f2937",
    padding: "1rem",
    minHeight: "500px",
    display: "flex",
    flexDirection: "column",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #1f2937",
  },
  columnTitle: { fontSize: "0.95rem", fontWeight: "600", margin: 0 },
  dot: { width: "8px", height: "8px", borderRadius: "50%" },
  taskCount: {
    backgroundColor: "#1f2937",
    color: "#9ca3af",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "0.125rem 0.5rem",
    borderRadius: "9999px",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    flex: 1,
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    padding: "1rem",
    cursor: "pointer",
    border: "1px solid #374151",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  priorityBadge: {
    fontSize: "0.65rem",
    fontWeight: "700",
    textTransform: "uppercase",
    padding: "0.125rem 0.375rem",
    borderRadius: "4px",
    letterSpacing: "0.05em",
  },
  cardLabelsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginBottom: "0.5rem",
  },
  tagBadge: {
    fontSize: "0.68rem",
    fontWeight: "700",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    letterSpacing: "0.02em",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: "1.25rem",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
  },
  cardTitle: {
    fontSize: "0.95rem",
    fontWeight: "600",
    margin: "0 0 0.375rem 0",
    color: "#f9fafb",
  },
  cardDesc: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    margin: "0 0 0.75rem 0",
    lineHeight: 1.4,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    marginTop: "0.5rem",
  },
  dueBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "0.2rem 0.5rem",
    borderRadius: "5px",
    fontWeight: "600",
    fontSize: "0.72rem",
  },
  avatarBadge: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  memberList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
    maxHeight: "240px",
    overflowY: "auto",
  },
  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1f2937",
    padding: "0.625rem 0.875rem",
    borderRadius: "8px",
    border: "1px solid #374151",
  },
  emptyColumn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4b5563",
    fontSize: "0.85rem",
    border: "2px dashed #1f2937",
    borderRadius: "6px",
    margin: "0.5rem 0",
    minHeight: "100px",
  },
  drawerOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1100,
    backdropFilter: "blur(3px)",
  },
  drawerContent: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: "#111827",
    height: "100%",
    borderLeft: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-10px 0 25px rgba(0,0,0,0.5)",
    overflowY: "auto",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #1f2937",
  },
  drawerHeaderTitle: { fontSize: "1.1rem", fontWeight: "600", margin: 0 },
  drawerBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    flex: 1,
  },
  divider: {
    border: "none",
    borderTop: "1px solid #1f2937",
    margin: "0.5rem 0",
  },
  sectionTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "0.75rem",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.625rem",
    marginBottom: "0.75rem",
  },
  commentItem: {
    backgroundColor: "#1f2937",
    padding: "0.625rem 0.875rem",
    borderRadius: "6px",
    border: "1px solid #374151",
  },
  commentBody: {
    fontSize: "0.85rem",
    margin: "0 0 0.25rem 0",
    color: "#f1f5f9",
  },
  commentDate: { fontSize: "0.7rem", color: "#94a3b8" },
  commentForm: { display: "flex", gap: "0.5rem" },
  activityList: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.78rem",
    color: "#94a3b8",
    backgroundColor: "#182232",
    padding: "0.4rem 0.625rem",
    borderRadius: "4px",
  },
  activityText: { color: "#cbd5e1" },
  activityDate: { color: "#64748b" },
  emptyText: { fontSize: "0.82rem", color: "#64748b", fontStyle: "italic" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    backgroundColor: "#111827",
    borderRadius: "12px",
    border: "1px solid #1f2937",
    width: "100%",
    maxWidth: "480px",
    padding: "1.5rem",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  modalTitle: { fontSize: "1.25rem", fontWeight: "600", margin: 0 },
  closeButton: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.375rem" },
  rowGroup: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.025em",
  },
  input: {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "6px",
    padding: "0.625rem",
    color: "#f9fafb",
    fontSize: "0.875rem",
    outline: "none",
    flex: 1,
  },
  textarea: {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "6px",
    padding: "0.625rem",
    color: "#f9fafb",
    fontSize: "0.875rem",
    outline: "none",
    resize: "vertical",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  cancelButton: {
    backgroundColor: "transparent",
    color: "#9ca3af",
    border: "1px solid #374151",
    padding: "0.625rem 1rem",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
};
