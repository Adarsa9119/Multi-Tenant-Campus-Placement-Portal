export default function Pagination({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return meta ? <div className="pager"><span>{meta.total} record(s)</span></div> : null;
  return (
    <div className="pager">
      <span>Page {meta.page} of {meta.pages} · {meta.total} records</span>
      <div className="btns">
        <button className="btn btn-light btn-sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</button>
        <button className="btn btn-light btn-sm" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>Next</button>
      </div>
    </div>
  );
}
