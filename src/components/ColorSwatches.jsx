import { COLOR_NAMES } from "../lib/constants";
import css from "./ColorSwatches.module.css";

// A row of color swatch buttons. `children` render at the end of the row
// (the modals put their submit button there). `labelId` names the group.
export default function ColorSwatches({
  colors,
  value,
  onChange,
  labelId,
  children,
}) {
  return (
    <div className={css.row}>
      <div role="group" aria-labelledby={labelId} className={css.group}>
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={COLOR_NAMES[color] ?? color}
            aria-pressed={value === color}
            className={css.swatch}
            style={{ "--swatch": color }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
