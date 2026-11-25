import { useId, useState } from "react";
import { AVATAR_COLORS } from "../lib/constants";
import { styles } from "../styles";
import { Avatar } from "./Badges";
import ColorSwatches from "./ColorSwatches";
import Modal from "./Modal";

export default function TeamModal({ teamMembers, onAdd, onDelete, onClose }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const id = useId();

  async function handleSubmit(e) {
    e.preventDefault();
    if (await onAdd({ name, role, color })) {
      setName("");
      setRole("");
    }
  }

  function handleDelete(member) {
    if (
      window.confirm(
        `Remove ${member.name}? Tasks assigned to them will become unassigned.`,
      )
    ) {
      onDelete(member);
    }
  }

  return (
    <Modal title="Team Members" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        style={{ ...styles.form, marginBottom: "1.25rem" }}
      >
        <div style={styles.rowGroup}>
          <div style={styles.fieldGroup}>
            <label htmlFor={`${id}-name`} style={styles.label}>
              Name *
            </label>
            <input
              id={`${id}-name`}
              data-autofocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label htmlFor={`${id}-role`} style={styles.label}>
              Role
            </label>
            <input
              id={`${id}-role`}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Developer"
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.fieldGroup}>
          <span id={`${id}-color`} style={styles.label}>
            Avatar Color
          </span>
          <ColorSwatches
            colors={AVATAR_COLORS}
            value={color}
            onChange={setColor}
            labelId={`${id}-color`}
          >
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
          </ColorSwatches>
        </div>
      </form>
      <hr style={styles.divider} />
      <div style={styles.memberList}>
        {teamMembers.map((member) => (
          <div key={member.id} style={styles.memberItem}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Avatar
                member={member}
                style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
              />
              <div>
                <div
                  style={{ fontWeight: "600", fontSize: "0.9rem", color: "#f8fafc" }}
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
              type="button"
              onClick={() => handleDelete(member)}
              style={styles.deleteBtn}
              aria-label={`Remove ${member.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <p style={styles.emptyText}>No team members added yet.</p>
        )}
      </div>
    </Modal>
  );
}
