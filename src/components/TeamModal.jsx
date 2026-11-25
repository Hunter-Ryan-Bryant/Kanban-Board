import { useId, useState } from "react";
import { AVATAR_COLORS } from "../lib/constants";
import { cx } from "../lib/utils";
import css from "./TeamModal.module.css";
import ui from "./ui.module.css";
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
      <form onSubmit={handleSubmit} className={cx(ui.form, ui.manageForm)}>
        <div className={ui.rowGroup}>
          <div className={ui.fieldGroup}>
            <label htmlFor={`${id}-name`} className={ui.label}>
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
              className={ui.input}
            />
          </div>
          <div className={ui.fieldGroup}>
            <label htmlFor={`${id}-role`} className={ui.label}>
              Role
            </label>
            <input
              id={`${id}-role`}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Developer"
              className={ui.input}
            />
          </div>
        </div>
        <div className={ui.fieldGroup}>
          <span id={`${id}-color`} className={ui.label}>
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
              className={cx(ui.primaryButton, ui.inlineSubmit)}
            >
              + Add Member
            </button>
          </ColorSwatches>
        </div>
      </form>
      <hr className={ui.divider} />
      <div className={ui.list}>
        {teamMembers.map((member) => (
          <div key={member.id} className={ui.listItem}>
            <div className={css.member}>
              <Avatar member={member} large />
              <div>
                <div className={css.name}>{member.name}</div>
                {member.role && (
                  <div className={css.role}>{member.role}</div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(member)}
              className={cx(ui.iconButton, ui.danger)}
              aria-label={`Remove ${member.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <p className={ui.emptyText}>No team members added yet.</p>
        )}
      </div>
    </Modal>
  );
}
