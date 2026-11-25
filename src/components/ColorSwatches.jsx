import { COLOR_NAMES } from "../lib/constants";

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
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <div
        role="group"
        aria-labelledby={labelId}
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
      >
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={COLOR_NAMES[color] ?? color}
            aria-pressed={value === color}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              backgroundColor: color,
              border:
                value === color ? "2px solid #ffffff" : "2px solid transparent",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
