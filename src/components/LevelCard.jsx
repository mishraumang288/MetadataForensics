import { useEffect, useMemo, useState } from 'react';
import exifr from 'exifr';
import { extractPdfMetadata } from '../utils/pdfParser';
import { flattenMetadata, formatValue, isSuspiciousKey, extractCoordinates } from '../utils/metadataHelpers';

export default function LevelCard({ level, status, onSolved, onRemediated, unlocked, report, updateReport }) {
  const [metadata, setMetadata] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  // Remediation states
  const [sanitizedFileName, setSanitizedFileName] = useState('');
  const [sanitizedError, setSanitizedError] = useState('');
  const [sanitizedSuccess, setSanitizedSuccess] = useState('');
  const [remediationBusy, setRemediationBusy] = useState(false);

  const [hintsRevealed, setHintsRevealed] = useState(0);

  useEffect(() => {
    setHintsRevealed(0);
  }, [level.id]);

  useEffect(() => {
    if (!unlocked) {
      setAnswer('');
      setFeedback('');
      setSanitizedFileName('');
      setSanitizedError('');
      setSanitizedSuccess('');
    }
  }, [unlocked]);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const rows = useMemo(() => {
    return metadata ? flattenMetadata(metadata) : [];
  }, [metadata]);

  const coordinates = useMemo(() => {
    if (!metadata) return null;
    return extractCoordinates(metadata);
  }, [metadata]);

  const statusLabel = status === 'completed'
    ? 'completed'
    : status === 'solved'
    ? 'solved'
    : unlocked
    ? 'unlocked'
    : 'locked';

  async function handleFile(file) {
    if (!file || !unlocked) return;

    setBusy(true);
    setError('');
    setFeedback('');
    setFileName(file.name);
    setMetadata(null);

    setPreview((currentPreview) => {
      if (currentPreview?.url) {
        URL.revokeObjectURL(currentPreview.url);
      }

      const nextPreview = {
        url: URL.createObjectURL(file),
        kind: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'other',
        name: file.name,
      };

      return nextPreview;
    });

    try {
      const parsed = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        ? await extractPdfMetadata(file)
        : await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
            xmp: true,
            iptc: true,
          });

      setMetadata(parsed || {});
    } catch (err) {
      setMetadata(null);
      setError(err?.message || 'Unable to read metadata from this file.');
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    void handleFile(file);
  }

  async function handleSampleLoad() {
    if (!unlocked) return;

    setSampleLoading(true);
    setError('');
    setFeedback('');

    try {
      const response = await fetch(level.downloadHref);
      if (!response.ok) {
        throw new Error(`Unable to load sample file (${response.status}).`);
      }

      const blob = await response.blob();
      const file = new File([blob], level.fileName, {
        type: blob.type || response.headers.get('content-type') || 'application/octet-stream',
      });

      await handleFile(file);
    } catch (err) {
      setError(err?.message || 'Unable to load the sample file in the page.');
    } finally {
      setSampleLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const success = await onSolved(level.id, answer.trim());
    if (success) {
      setFeedback('Correct codeword. Level unlocked.');
    } else {
      setFeedback('Incorrect codeword. Inspect the metadata and try again.');
    }
  }

  async function handleSanitizedFile(file) {
    if (!file || !unlocked) return;
    setRemediationBusy(true);
    setSanitizedError('');
    setSanitizedSuccess('');
    setSanitizedFileName(file.name);

    try {
      const parsed = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        ? await extractPdfMetadata(file)
        : await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
            xmp: true,
            iptc: true,
          });

      const data = parsed || {};
      const coords = extractCoordinates(data);
      const flat = flattenMetadata(data);
      const hasSuspicious = flat.some((row) => isSuspiciousKey(row.key));

      if (coords || hasSuspicious) {
        setSanitizedError('Validation Failed: The file still contains sensitive metadata fields (e.g., GPS coordinates or descriptive keys).');
      } else {
        setSanitizedSuccess('Validation Passed: The file metadata has been successfully sanitized.');
        onRemediated(level.id);
      }
    } catch (err) {
      // If parser fails completely (e.g., header stripped), it indicates a sanitized file.
      setSanitizedSuccess('Validation Passed: The file metadata has been successfully sanitized.');
      onRemediated(level.id);
    } finally {
      setRemediationBusy(false);
    }
  }

  function handleSanitizedDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    void handleSanitizedFile(file);
  }

  return (
    <div className="level-page-container">
      <div className="page-navigation-header">
        <a href="#/" className="back-to-console-link">
          ← Back to Lab Console
        </a>
      </div>

      <section className={`level-card ${statusLabel}`}>
        <div className="level-header">
          <div>
            <p className="level-kicker">
              Level {level.id} &bull; <span className="level-difficulty-kicker">{level.difficulty}</span>
            </p>
            <h2>{level.title}</h2>
            <p className="level-description">{level.description}</p>
          </div>
          {statusLabel !== 'unlocked' && (
            <span className={`status-pill ${statusLabel}`}>
              {statusLabel === 'completed' ? 'investigated & sanitized' : statusLabel}
            </span>
          )}
        </div>

        <div className="level-actions">
          <button type="button" className="download-button" onClick={() => void handleSampleLoad()} disabled={!unlocked || sampleLoading}>
            {sampleLoading ? 'Loading sample...' : `Open ${level.fileName} in page`}
          </button>
          <a href={level.downloadHref} download={level.fileName} className="download-asset-button" title="Download raw asset file">
            Download raw file
          </a>
          <span className="file-note">Evidence asset</span>
        </div>

        <label
          className={`upload-zone ${unlocked ? 'ready' : 'locked-zone'}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            disabled={!unlocked}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <div>
            <strong>{unlocked ? 'Drop raw file here or click to upload' : 'Locked until previous level is completed'}</strong>
            <p>{fileName || 'Use the provided download first, then upload your inspected file here.'}</p>
          </div>
        </label>

        {/* Evidence Notepad Panel */}
        <div className="evidence-notes-panel">
          <h4>Evidence Notes (Lab Report)</h4>
          <div className="notes-fields-grid">
            <label className="notes-field">
              <span>Suspicious Fields Found</span>
              <input
                type="text"
                placeholder="e.g., ImageDescription, Keywords, Author"
                value={report.suspiciousFields}
                disabled={!unlocked}
                onChange={(e) => updateReport({ suspiciousFields: e.target.value })}
              />
            </label>
            <label className="notes-field">
              <span>Forensic Interpretation</span>
              <input
                type="text"
                placeholder="Explain how this value points to the codeword"
                value={report.interpretation}
                disabled={!unlocked}
                onChange={(e) => updateReport({ interpretation: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Progressive Hints Drawer */}
        <div className="hints-section-container">
          <div className="hints-header-row">
            <h4>💡 Lab Guide & Hints</h4>
            <span className="hints-count-badge">{hintsRevealed}/3 revealed</span>
          </div>
          <div className="hints-reveal-area">
            {hintsRevealed >= 1 && (
              <div className="hint-card hint-1">
                <span className="hint-label">Hint 1: Diagnostic Step</span>
                <p>{level.hint1}</p>
              </div>
            )}
            {hintsRevealed >= 2 && (
              <div className="hint-card hint-2">
                <span className="hint-label">Hint 2: Key Identifier</span>
                <p>{level.hint2}</p>
              </div>
            )}
            {hintsRevealed >= 3 && (
              <div className="hint-card hint-3">
                <span className="hint-label">Hint 3: Solving Detail</span>
                <p>{level.hint3}</p>
              </div>
            )}
            {hintsRevealed < 3 && (
              <button
                type="button"
                className="reveal-hint-button"
                onClick={() => setHintsRevealed((prev) => prev + 1)}
              >
                Reveal Hint {hintsRevealed + 1}
              </button>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title-row">
            <h3>Metadata</h3>
            {busy ? <span className="mini-badge">Reading...</span> : null}
          </div>
          <p className="panel-note">Open the file preview beside the extracted fields and treat the upload like evidence.</p>
          {error ? <p className="error-text">{error}</p> : null}
          <div className={`evidence-grid ${preview ? 'has-preview' : ''}`}>
            <div className="preview-pane">
              <div className="panel-subtitle-row">
                <h4>File Preview</h4>
                {preview ? <span className="mini-badge">{preview.kind}</span> : null}
              </div>
              {preview ? (
                <div className="preview-frame">
                  {preview.kind === 'image' ? (
                    <img src={preview.url} alt={`Preview of ${preview.name}`} />
                  ) : preview.kind === 'pdf' ? (
                    <iframe
                      title={`${preview.name} preview`}
                      src={preview.url}
                      loading="lazy"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <strong>Preview unavailable</strong>
                      <p>This file type can still be analyzed through metadata.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="preview-placeholder">
                  <strong>No file loaded</strong>
                  <p>Upload the downloaded asset to preview it here.</p>
                </div>
              )}
            </div>

            <div className="metadata-pane">
              {rows.length === 0 ? (
                <p className="empty-state">Upload a file to reveal metadata.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={`${row.key}-${index}`} className={isSuspiciousKey(row.key) ? 'highlight' : ''}>
                          <td>{row.key}</td>
                          <td>{formatValue(row.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {coordinates ? (
                <div className="map-block">
                  <p className="hint-text">These coordinates point somewhere in Vienna...</p>
                  <div className="coords">
                    <span>GPSLatitude: {coordinates.lat}</span>
                    <span>GPSLongitude: {coordinates.lng}</span>
                  </div>
                  <iframe
                    title="Google Maps preview"
                    src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <form className="flag-form" onSubmit={handleSubmit}>
          <label>
            <span>Codeword</span>
            <input
              type="text"
              placeholder={unlocked ? 'Enter the recovered codeword' : 'Locked'}
              value={answer}
              disabled={!unlocked || status === 'solved' || status === 'completed'}
              onChange={(event) => setAnswer(event.target.value)}
            />
          </label>
          <button type="submit" disabled={!unlocked || status === 'solved' || status === 'completed'}>
            Verify
          </button>
        </form>

        {status === 'solved' || status === 'completed' ? (
          <p className="feedback success">Correct codeword. Codeword unlocked.</p>
        ) : feedback ? (
          <p className={`feedback ${feedback.startsWith('Correct') ? 'success' : 'warning'}`}>{feedback}</p>
        ) : null}

        {/* Remediation Challenge Section */}
        {(status === 'solved' || status === 'completed') && (
          <div className="remediation-section">
            <div className="remediation-header">
              <h4>Operational Security: Strip Metadata</h4>
              <p>
                Excellent work recovering the codeword. Now, strip the metadata from the file (using command line tools like <code>exiftool -all= &lt;filename&gt;</code> or an online cleaning tool) and upload the sanitized file below to complete this level.
              </p>
            </div>
            <label
              className={`upload-zone remediation-zone ${status === 'completed' ? 'completed-zone' : 'ready'}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleSanitizedDrop}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                disabled={status === 'completed'}
                onChange={(event) => void handleSanitizedFile(event.target.files?.[0])}
              />
              <div>
                <strong>{status === 'completed' ? '✓ File Sanitized & Verified' : 'Drop sanitized file here or click to upload'}</strong>
                <p>{sanitizedFileName || 'Upload the cleaned version of the evidence file.'}</p>
              </div>
            </label>
            {remediationBusy && <span className="remediation-loader">Checking metadata...</span>}
            {sanitizedError && <p className="feedback warning">{sanitizedError}</p>}
            {sanitizedSuccess && <p className="feedback success">{sanitizedSuccess}</p>}
          </div>
        )}
      </section>

      {level.id < 3 && status === 'completed' && (
        <div className="next-level-navigation">
          <a href={`#/level/${level.id + 1}`} className="next-level-btn">
            Proceed to Level {level.id + 1} →
          </a>
        </div>
      )}
    </div>
  );
}
