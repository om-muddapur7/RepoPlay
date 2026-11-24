export function TemporaryPreviewForm() {
  return (
    <div className="preview-panel">
      <form id="preview-form">
        <label htmlFor="repository">GitHub repository URL</label>
        <div className="preview-input-row">
          <input id="repository" name="repository" type="url" placeholder="https://github.com/owner/repo" required maxLength={256} />
          <button className="button" type="submit">Create preview</button>
        </div>
        <label className="frontend-option"><input type="checkbox" name="frontendOnly" /> Frontend demo</label>
      </form>
      <p id="preview-result" className="preview-result" role="status" hidden></p>
    </div>
  );
}
