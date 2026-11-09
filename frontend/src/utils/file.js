export const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];
export const MAX_MB = 5;
export function validateResumeFile(file) {
  if (!file) return 'Choose a file';
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return 'Only PDF, DOC and DOCX files are allowed';
  if (file.size > MAX_MB * 1024 * 1024) return `File must be smaller than ${MAX_MB} MB`;
  return null;
}
export const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`);
export const openBlob = (blob) => { const url = URL.createObjectURL(blob); window.open(url, '_blank', 'noopener'); setTimeout(() => URL.revokeObjectURL(url), 60000); };
export const downloadBlob = (blob, name) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); };
