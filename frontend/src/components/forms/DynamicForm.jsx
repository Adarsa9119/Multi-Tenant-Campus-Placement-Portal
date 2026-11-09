import { useState } from 'react';
import Field from './Field.jsx';

const clean = (fields, values) => {
  const out = {};
  fields.forEach((f) => {
    let v = values[f.name];
    if (f.type === 'tags') v = (v || []).map((s) => String(s).trim()).filter(Boolean);
    if (f.type === 'number' && v !== '' && v !== undefined) v = Number(v);
    if (v === '' || v === undefined) return;
    out[f.name] = v;
  });
  return out;
};

// Declarative form: fields = [{name,label,type,options,required,...}]; validates required fields client-side (server validates again).
export default function DynamicForm({ fields, initial = {}, onSubmit, onCancel, submitLabel = 'Save', disabled }) {
  const [values, setValues] = useState(() => ({ ...initial }));
  const [errors, setErrors] = useState({});
  const change = (name, v) => { setValues((s) => ({ ...s, [name]: v })); setErrors((e) => ({ ...e, [name]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    fields.forEach((f) => {
      const v = values[f.name];
      const empty = v === undefined || v === '' || (Array.isArray(v) && !v.length);
      if (f.required && empty) errs[f.name] = `${f.label} is required`;
      if (f.validate && !empty) { const m = f.validate(v, values); if (m) errs[f.name] = m; }
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(clean(fields, values));
  };
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-grid">
        {fields.map((f) => <Field key={f.name} field={f} value={values[f.name]} onChange={change} error={errors[f.name]} />)}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        {onCancel && <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn" disabled={disabled}>{submitLabel}</button>
      </div>
    </form>
  );
}
