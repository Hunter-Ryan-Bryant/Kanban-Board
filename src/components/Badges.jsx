import { cx, getInitials } from "../lib/utils";
import css from "./Badges.module.css";

export function LabelBadge({ label, large = false }) {
  return (
    <span
      className={cx(css.tag, large && css.tagLarge)}
      style={{ "--label": label.color }}
    >
      {label.name}
    </span>
  );
}

export function Avatar({ member, large = false, title }) {
  return (
    <div
      role="img"
      aria-label={title ?? member.name}
      title={title}
      className={cx(css.avatar, large && css.avatarLarge)}
      style={{ "--swatch": member.avatar_color }}
    >
      {getInitials(member.name)}
    </div>
  );
}
