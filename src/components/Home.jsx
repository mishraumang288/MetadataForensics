import React from 'react';

export default function Home({ levels, statuses, completedCount }) {
  const extractionLevels = levels.filter((l) => [1, 2, 3, 6, 7].includes(l.id));
  const correlationLevels = levels.filter((l) => [4, 8, 9, 11].includes(l.id));
  const validationLevels = levels.filter((l) => [5, 10].includes(l.id));

  const getFormatBadge = (fileName) => {
    const ext = fileName.split('.').pop().toUpperCase();
    return <span className={`format-badge ${ext.toLowerCase()}`}>{ext}</span>;
  };

  const getCategoryProgress = (categoryLevels) => {
    const completed = categoryLevels.filter((l) => statuses[l.id] === 'completed').length;
    return `${completed}/${categoryLevels.length}`;
  };

  const renderLevelCard = (level) => {
    const status = statuses[level.id];

    return (
      <div key={level.id} className={`home-level-card ${status}`}>
        <div className="card-top">
          <span className="level-id-kicker">Level {level.id}</span>
          <div className="card-top-badges">
            <span className="difficulty-badge">{level.difficulty}</span>
            {getFormatBadge(level.fileName)}
            {status !== 'unlocked' && (
              <span className={`status-pill ${status}`}>
                {status === 'completed' ? 'completed & sanitized' : status}
              </span>
            )}
          </div>
        </div>
        <h3>{level.title}</h3>
        <p className="description">{level.description}</p>
        <div className="asset-info-row">
          <span>Target: <code>{level.fileName}</code></span>
        </div>
        <div className="card-actions">
          <a href={`#/level/${level.id}`} className="action-btn active">
            {status === 'completed' ? 'Review Level' : 'Start Operation'}
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="home-dashboard">
      <section className="intro-section">
        <h2>Forensics Console & Learning Curriculum</h2>
        <p className="intro-text">
          Welcome to the digital forensics lab. Metadata consists of hidden data blocks embedded inside files. 
          While invisible to casual users, these fields can expose critical operational secrets, authorship trails, 
          and geographic locations. This CTF challenge guides you through identifying these exposures and sanitizing files to mitigate risk.
        </p>

        <div className="curriculum-grid">
          <div className="curriculum-card">
            <span className="concept-badge">Concept 1</span>
            <h3>EXIF Meta Exposure</h3>
            <p>
              Exchangeable Image File Format (EXIF) embeds operational data into JPEG/TIFF files. 
              Camera settings, device serials, and custom comments (like <code>ImageDescription</code>) 
              can persist, leaking sensitive information even if the image content itself looks harmless.
            </p>
          </div>

          <div className="curriculum-card">
            <span className="concept-badge">Concept 2</span>
            <h3>Document Provenance</h3>
            <p>
              PDF and office documents maintain catalogs detailing modification dates, creator software, 
              original authors, and subjects. Analyzing these headers reveals document provenance, 
              tracking revision histories and exposing corporate file creation workflows.
            </p>
          </div>

          <div className="curriculum-card">
            <span className="concept-badge">Concept 3</span>
            <h3>Geotagging & OSINT</h3>
            <p>
              Many mobile devices automatically tag photographs with GPS coordinates. 
              Open Source Intelligence (OSINT) analysts parse these latitude/longitude values to resolve 
              locations on satellite maps, compromising operational security and revealing physical itineraries.
            </p>
          </div>
        </div>
      </section>

      <section className="challenges-section">
        <h2>Challenge Operations</h2>

        <div className="category-section">
          <div className="category-header">
            <h3>🔍 Metadata Extraction Challenges</h3>
            <span className="category-progress">{getCategoryProgress(extractionLevels)} Complete</span>
          </div>
          <div className="home-level-grid">
            {extractionLevels.map(renderLevelCard)}
          </div>
        </div>

        <div className="category-section">
          <div className="category-header">
            <h3>🧩 Correlation & Investigation Challenges</h3>
            <span className="category-progress">{getCategoryProgress(correlationLevels)} Complete</span>
          </div>
          <div className="home-level-grid">
            {correlationLevels.map(renderLevelCard)}
          </div>
        </div>

        <div className="category-section">
          <div className="category-header">
            <h3>🛡️ Validation & Sanitization Challenges</h3>
            <span className="category-progress">{getCategoryProgress(validationLevels)} Complete</span>
          </div>
          <div className="home-level-grid">
            {validationLevels.map(renderLevelCard)}
          </div>
        </div>
      </section>
    </div>
  );
}
