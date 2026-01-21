export default function Checkbox({ children, attributes }) {
  return (
    <label>
      <input type="checkbox" {...attributes} />
      {children}
    </label>
  );
}
