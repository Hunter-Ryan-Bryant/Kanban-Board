// A row of color swatch buttons. `children` render at the end of the row
// (the modals put their submit button there).
export default function ColorSwatches({ colors, value, onChange, children }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
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
      {children}
    </div>
  );
}
