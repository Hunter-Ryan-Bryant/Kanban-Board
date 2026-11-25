import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { errorMessage, removeById, upsertById } from "../lib/utils";

function omit(object, key) {
  const next = { ...object };
  delete next[key];
  return next;
}

// State for the task detail drawer. The open task is derived from the
// workspace's `tasks` plus any unsaved `drafts`, so remote updates and
// rollbacks show up automatically without clobbering what the user is typing.
export function useTaskDetail(workspace, notify) {
  const { tasks, userId, updateTaskField, toggleTaskLabel, logActivity } =
    workspace;

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [comments, setComments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  // Mirrors selectedTaskId for async callbacks, so slow responses for a
  // previously opened task don't land in the current one.
  const openTaskIdRef = useRef(null);

  const savedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );
  const selectedTask = useMemo(
    () => (savedTask ? { ...savedTask, ...drafts } : null),
    [savedTask, drafts],
  );

  function addActivity(row) {
    if (row && row.task_id === openTaskIdRef.current) {
      setActivityLogs((prev) => upsertById(prev, row, { prepend: true }));
    }
  }

  async function open(task) {
    openTaskIdRef.current = task.id;
    setSelectedTaskId(task.id);
    setDrafts({});
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
    const error = commentsRes.error || activityRes.error;
    if (error) notify(`Couldn't load task history: ${error.message}`);
    setComments(commentsRes.data || []);
    setActivityLogs(activityRes.data || []);
  }

  function close() {
    openTaskIdRef.current = null;
    setSelectedTaskId(null);
    setDrafts({});
  }

  // Live comments and activity for the open task, plus a notice if it's
  // deleted elsewhere. (The drawer hides by itself once the task leaves
  // `tasks`; this only explains why.) Delete events can't be filtered
  // server-side, so the id is checked here.
  useEffect(() => {
    if (!selectedTaskId) return;
    const filter = `task_id=eq.${selectedTaskId}`;
    const channel = supabase
      .channel(`task-${selectedTaskId}`)
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        ({ old }) => {
          if (old.id !== openTaskIdRef.current) return;
          openTaskIdRef.current = null;
          setSelectedTaskId(null);
          setDrafts({});
          notify("The task you were viewing was deleted.");
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_comments", filter },
        ({ eventType, new: row, old }) =>
          setComments((prev) =>
            eventType === "DELETE"
              ? removeById(prev, old.id)
              : upsertById(prev, row),
          ),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "task_activity", filter },
        ({ new: row }) =>
          setActivityLogs((prev) => upsertById(prev, row, { prepend: true })),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTaskId, notify]);

  // Text inputs: update the local draft only; saveField writes on blur.
  function editField(field, value) {
    setDrafts((prev) => ({ ...prev, [field]: value }));
  }

  async function saveField(field, value) {
    const taskId = selectedTaskId;
    if (!taskId) return;
    setDrafts((prev) => omit(prev, field));
    addActivity(await updateTaskField(taskId, field, value));
  }

  async function toggleLabel(labelId) {
    if (!selectedTaskId) return;
    addActivity(await toggleTaskLabel(selectedTaskId, labelId));
  }

  // Returns true once the comment is saved, so the form can clear itself.
  async function addComment(body) {
    const taskId = selectedTaskId;
    if (!body.trim() || !taskId || !userId) return false;
    const { data, error } = await supabase
      .from("task_comments")
      .insert([{ task_id: taskId, user_id: userId, body: body.trim() }])
      .select();
    if (error || !data) {
      notify(`Couldn't post comment: ${errorMessage(error)}`);
      return false;
    }
    if (openTaskIdRef.current === taskId) {
      setComments((prev) => upsertById(prev, data[0]));
    }
    logActivity(taskId, "commented", "Added a comment").then(addActivity);
    return true;
  }

  return {
    selectedTask,
    comments,
    activityLogs,
    open,
    close,
    editField,
    saveField,
    toggleLabel,
    addComment,
  };
}
