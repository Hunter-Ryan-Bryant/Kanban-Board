import { useEffect, useMemo, useState } from "react";
import { supabase, getOrCreateGuestSession } from "../supabaseClient";
import {
  describeFieldChange,
  describeLabelChange,
  describeMove,
} from "../lib/activity";
import { errorMessage, indexById, removeById, upsertById } from "../lib/utils";

function fetchWorkspace() {
  return Promise.all([
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.from("labels").select("*").order("created_at", { ascending: true }),
    supabase.from("task_labels").select("*"),
  ]);
}

const normalize = (value) =>
  value === "" || value === undefined ? null : value;

// Owns the signed-in session and the board's four collections (tasks, team
// members, labels, task-label links): loading them, keeping them in sync via
// realtime, and every write to them. Writes update the UI optimistically and
// roll back with a toast on failure.
export function useWorkspace(notify) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("connecting");
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [taskLabels, setTaskLabels] = useState([]);

  const userId = session?.user?.id;

  // Applies a fetchWorkspace() result. Collections whose query failed keep
  // their current data. Returns the first error, if any.
  function applyFetched([tasksRes, membersRes, labelsRes, taskLabelsRes]) {
    if (!tasksRes.error) setTasks(tasksRes.data || []);
    if (!membersRes.error) setTeamMembers(membersRes.data || []);
    if (!labelsRes.error) setLabels(labelsRes.data || []);
    if (!taskLabelsRes.error) setTaskLabels(taskLabelsRes.data || []);
    return (
      tasksRes.error ||
      membersRes.error ||
      labelsRes.error ||
      taskLabelsRes.error ||
      null
    );
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
      const error = applyFetched(await fetchWorkspace());
      if (error) {
        setLoadError(`Couldn't load your workspace: ${error.message}`);
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let hasConnected = false;

    const syncList =
      (setter, options) =>
      ({ eventType, new: row, old }) =>
        setter((prev) =>
          eventType === "DELETE"
            ? removeById(prev, old.id)
            : upsertById(prev, row, options),
        );

    function handleTaskChange(payload) {
      syncList(setTasks, { prepend: true })(payload);
      if (payload.eventType === "DELETE") {
        setTaskLabels((prev) =>
          prev.filter((tl) => tl.task_id !== payload.old.id),
        );
      }
    }

    function handleTeamMemberChange(payload) {
      syncList(setTeamMembers)(payload);
      if (payload.eventType === "DELETE") {
        const id = payload.old.id;
        setTasks((prev) =>
          prev.map((t) =>
            t.assignee_id === id ? { ...t, assignee_id: null } : t,
          ),
        );
      }
    }

    function handleLabelChange(payload) {
      syncList(setLabels)(payload);
      if (payload.eventType === "DELETE") {
        setTaskLabels((prev) =>
          prev.filter((tl) => tl.label_id !== payload.old.id),
        );
      }
    }

    const watch = (table) => ({ event: "*", schema: "public", table });
    const channel = supabase
      .channel(`workspace-${userId}`)
      .on("postgres_changes", watch("tasks"), handleTaskChange)
      .on("postgres_changes", watch("task_labels"), syncList(setTaskLabels))
      .on("postgres_changes", watch("labels"), handleLabelChange)
      .on("postgres_changes", watch("team_members"), handleTeamMemberChange)
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("live");
          // After a reconnect, refetch to pick up anything missed while offline.
          if (hasConnected) fetchWorkspace().then(applyFetched);
          hasConnected = true;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("offline");
          console.warn("Realtime connection problem:", status, err?.message);
        } else if (status === "CLOSED") {
          setRealtimeStatus("offline");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const memberMap = useMemo(() => indexById(teamMembers), [teamMembers]);
  const labelMap = useMemo(() => indexById(labels), [labels]);
  const taskLabelsMap = useMemo(() => {
    const map = {};
    taskLabels.forEach((tl) => {
      if (!map[tl.task_id]) map[tl.task_id] = [];
      map[tl.task_id].push(tl.label_id);
    });
    return map;
  }, [taskLabels]);

  // Best-effort: a failure here shouldn't undo the change the user just
  // made, so it's only logged to the console. Returns the new row or null.
  async function logActivity(taskId, action, details) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("task_activity")
      .insert([{ task_id: taskId, user_id: userId, action, details }])
      .select()
      .single();
    if (error) {
      console.warn("Failed to log activity:", error.message);
      return null;
    }
    return data;
  }

  async function addTeamMember({ name, role, color }) {
    if (!name.trim() || !userId) return false;
    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          name: name.trim(),
          role: role.trim() || null,
          avatar_color: color,
          user_id: userId,
        },
      ])
      .select();
    if (error || !data) {
      notify(`Couldn't add team member: ${errorMessage(error)}`);
      return false;
    }
    setTeamMembers((prev) => upsertById(prev, data[0]));
    return true;
  }

  async function deleteTeamMember(member) {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", member.id);
    if (error) {
      notify(`Couldn't remove team member: ${error.message}`);
      return false;
    }
    setTeamMembers((prev) => removeById(prev, member.id));
    setTasks((prev) =>
      prev.map((t) =>
        t.assignee_id === member.id ? { ...t, assignee_id: null } : t,
      ),
    );
    return true;
  }

  async function addLabel({ name, color }) {
    if (!name.trim() || !userId) return false;
    const { data, error } = await supabase
      .from("labels")
      .insert([{ name: name.trim(), color, user_id: userId }])
      .select();
    if (error || !data) {
      notify(`Couldn't add label: ${errorMessage(error)}`);
      return false;
    }
    setLabels((prev) => upsertById(prev, data[0]));
    return true;
  }

  async function deleteLabel(label) {
    const { error } = await supabase.from("labels").delete().eq("id", label.id);
    if (error) {
      notify(`Couldn't delete label: ${error.message}`);
      return false;
    }
    setLabels((prev) => removeById(prev, label.id));
    setTaskLabels((prev) => prev.filter((tl) => tl.label_id !== label.id));
    return true;
  }

  // `values`: { title, description, priority, status, due_date, assignee_id }
  async function createTask(values, labelIds) {
    if (!values.title.trim()) return false;

    let activeSession = session;
    if (!activeSession?.user) {
      activeSession = await getOrCreateGuestSession();
      if (!activeSession?.user) {
        notify("Couldn't create task: no active session.");
        return false;
      }
      setSession(activeSession);
    }
    const ownerId = activeSession.user.id;

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
          status: values.status,
          due_date: values.due_date || null,
          assignee_id: values.assignee_id || null,
          user_id: ownerId,
        },
      ])
      .select();
    if (error || !data) {
      notify(`Couldn't create task: ${errorMessage(error)}`);
      return false;
    }

    const newTask = data[0];
    setTasks((prev) => upsertById(prev, newTask, { prepend: true }));

    if (labelIds.length > 0) {
      const { data: tlData, error: tlError } = await supabase
        .from("task_labels")
        .insert(
          labelIds.map((label_id) => ({
            task_id: newTask.id,
            label_id,
            user_id: ownerId,
          })),
        )
        .select();
      if (tlError) {
        notify(`Task created, but labels couldn't be added: ${tlError.message}`);
      } else if (tlData) {
        setTaskLabels((prev) =>
          tlData.reduce((list, row) => upsertById(list, row), prev),
        );
      }
    }

    logActivity(newTask.id, "created", "Created the task");
    return true;
  }

  async function deleteTask(task) {
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      notify(`Couldn't delete task: ${error.message}`);
      return false;
    }
    setTasks((prev) => removeById(prev, task.id));
    setTaskLabels((prev) => prev.filter((tl) => tl.task_id !== task.id));
    return true;
  }

  // Saves one field if it differs from the stored value. Returns the logged
  // activity row, or null if nothing was saved.
  async function updateTaskField(taskId, field, value, activity) {
    const saved = tasks.find((t) => t.id === taskId);
    if (!saved) return null;

    const previous = saved[field];
    const next = normalize(field === "title" ? value.trim() : value);
    if (field === "title" && next === null) {
      notify("Title can't be empty.");
      return null;
    }
    if (normalize(previous) === next) return null;

    const apply = (v) =>
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, [field]: v } : t)),
      );

    apply(next);
    const { error } = await supabase
      .from("tasks")
      .update({ [field]: next })
      .eq("id", taskId);
    if (error) {
      apply(previous);
      notify(`Couldn't save ${field.replace("_", " ")}: ${error.message}`);
      return null;
    }
    const { action, details } = activity?.(previous, next) ?? {
      action: "updated",
      details: describeFieldChange(field, next, { memberMap }),
    };
    return logActivity(taskId, action, details);
  }

  function moveTask(taskId, status) {
    return updateTaskField(taskId, "status", status, (from, to) => ({
      action: "moved_column",
      details: describeMove(from, to),
    }));
  }

  // Returns the logged activity row, or null on failure.
  async function toggleTaskLabel(taskId, labelId) {
    if (!userId) return null;
    const existing = taskLabels.find(
      (tl) => tl.task_id === taskId && tl.label_id === labelId,
    );
    if (existing) {
      const { error } = await supabase
        .from("task_labels")
        .delete()
        .eq("id", existing.id);
      if (error) {
        notify(`Couldn't remove label: ${error.message}`);
        return null;
      }
      setTaskLabels((prev) => removeById(prev, existing.id));
      return logActivity(
        taskId,
        "label_removed",
        describeLabelChange(false, labelMap[labelId]),
      );
    }

    const { data, error } = await supabase
      .from("task_labels")
      .insert([{ task_id: taskId, label_id: labelId, user_id: userId }])
      .select();
    if (error || !data) {
      notify(`Couldn't add label: ${errorMessage(error)}`);
      return null;
    }
    setTaskLabels((prev) => upsertById(prev, data[0]));
    return logActivity(
      taskId,
      "label_added",
      describeLabelChange(true, labelMap[labelId]),
    );
  }

  return {
    userId,
    loading,
    loadError,
    realtimeStatus,
    tasks,
    teamMembers,
    labels,
    memberMap,
    labelMap,
    taskLabelsMap,
    logActivity,
    addTeamMember,
    deleteTeamMember,
    addLabel,
    deleteLabel,
    createTask,
    deleteTask,
    updateTaskField,
    moveTask,
    toggleTaskLabel,
  };
}
