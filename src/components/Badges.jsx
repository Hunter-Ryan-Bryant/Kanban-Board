import { getInitials } from "../lib/utils";
import { styles } from "../styles";

export function LabelBadge({ label, style }) {
  return (
    <span
      style={{
        ...styles.tagBadge,
        backgroundColor: `${label.color}25`,
        color: label.color,
        border: `1px solid ${label.color}50`,
        ...style,
      }}
    >
      {label.name}
    </span>
  );
}

export function Avatar({ member, style, title }) {
  return (
    <div
      style={{
        ...styles.avatarBadge,
        backgroundColor: member.avatar_color,
        ...style,
      }}
      title={title}
    >
      {getInitials(member.name)}
    </div>
  );
}
