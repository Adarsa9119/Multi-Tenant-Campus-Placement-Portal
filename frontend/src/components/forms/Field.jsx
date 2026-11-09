export default function Field({ field, value, onChange, error }) {
  const { name, label, type = 'text', options = [], required, placeholder, help, rows = 3, min, max, step } = field;
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  let input;
  if (type === 'select') {
    input = (
      <select id={name} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)}>
        <option value="">{placeholder || 'Select…'}</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (type === 'textarea') input = <textarea id={name} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(name, e.target.value)} />;
  else if (type === 'multiselect') {
    const cur = value || [];
    input = (
      <div className="checks">
        {opts.map((o) => (
          <label key={o.value}>
            <input type="checkbox" checked={cur.includes(o.value)} onChange={(e) => onChange(name, e.target.checked ? [...cur, o.value] : cur.filter((x) => x !== o.value))} /> {o.label}
          </label>
        ))}
      </div>
    );
  } else if (type === 'checkbox') {
    input = <label className="check-row"><input type="checkbox" checked={!!value} onChange={(e) => onChange(name, e.target.checked)} /> <span>{help || label}</span></label>;
    return <div className="field full">{input}{error && <span className="err">{error}</span>}</div>;
  } else if (type === 'tags') {
    input = <input id={name} value={Array.isArray(value) ? value.join(', ') : value ?? ''} placeholder={placeholder || 'Comma separated'} onChange={(e) => onChange(name, e.target.value.split(',').map((s) => s.trimStart()))} />;
  } else {
    input = <input id={name} type={type} value={value ?? ''} placeholder={placeholder} min={min} max={max} step={step} autoComplete={type === 'password' ? 'new-password' : 'off'} onChange={(e) => onChange(name, e.target.value)} />;
  }
  return (
    <div className={`field ${field.full ? 'full' : ''}`}>
      <label htmlFor={name}>{label}{required && <span className="req"> *</span>}</label>
      {input}
      {help && type !== 'checkbox' && <span className="help">{help}</span>}
      {error && <span className="err">{error}</span>}
    </div>
  );
}
