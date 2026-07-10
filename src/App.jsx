import { useState, useEffect } from 'react';
import Home from './components/Home';
import LevelCard from './components/LevelCard';
import DecoderDrawer from './components/DecoderDrawer';

const LEVELS = [
  {
    id: 1,
    title: 'Level 1 - Sensor Trace',
    description: 'A travel image with one exposed field and one decoy clue.',
    fileName: 'image.jpg',
    downloadHref: '/challenge-files/level1/image.jpg',
    expectedHash: 'f6020eec49176c82acf0e31c5a063a29b86075059889f78f139171f090e135e2',
    difficulty: 'Easy ⭐',
    hint1: 'Run "exiftool image.jpg" in your terminal to see all metadata fields.',
    hint2: 'Scan the output list for the "Image Description" or "Description" metadata tag.',
    hint3: 'The description "Qk9ST0JVRFVS" is encoded in Base64. Decode it to find the codeword.',
  },
  {
    id: 2,
    title: 'Level 2 - Document Provenance',
    description: 'A PDF that leaks authoring and revision metadata.',
    fileName: 'document.pdf',
    downloadHref: '/challenge-files/level2/document.pdf',
    expectedHash: 'f48ca4a60541030e2447c29a23f6b630b5e61d33d53cd7410315927fd456aa34',
    difficulty: 'Easy ⭐',
    hint1: 'Inspect the document properties using "pdfinfo document.pdf" or "exiftool document.pdf".',
    hint2: 'Look closely at the "Keywords" metadata attribute in the list.',
    hint3: 'The string "5044465F4C45414B" is hexadecimal-encoded. Convert it to ASCII text.',
  },
  {
    id: 3,
    title: 'Level 3 - Location Reconstruction',
    description: 'A geotagged photo that points back to a Vienna landmark.',
    fileName: 'photo.png',
    downloadHref: '/challenge-files/level3/photo.png',
    expectedHash: '5b15f502076c244034cc85705737a6487627202b2e25cb02fb196d37515af6ad',
    difficulty: 'Medium ⭐⭐',
    hint1: 'Extract all tags with "exiftool photo.png" to find location and description tags.',
    hint2: 'Look up the GPS latitude/longitude coordinates on Google Maps to find the location name.',
    hint3: 'The "Description" tag is encrypted using ROT13: "XHAFGUVFGBEVFPURF_ZHFRHZ". Decode it.',
  },
  {
    id: 4,
    title: 'Level 4 - Metadata Correlation',
    description: 'Compare the JPEG image and PDF document inside the ZIP to identify the common creator.',
    fileName: 'evidence.zip',
    downloadHref: '/challenge-files/level4/evidence.zip',
    expectedHash: 'e7dcee3cc63d170ba049da2c754a63ea55dcdd8d36f19c552cb59e0d4063b660',
    difficulty: 'Medium ⭐⭐',
    hint1: 'Extract the files from "evidence.zip" and inspect the metadata of both JPG and PDF.',
    hint2: 'Check creator fields like "Artist" on the image and "Author" on the PDF.',
    hint3: 'The codeword is the name of the common creator who produced both files (in uppercase).',
  },
  {
    id: 5,
    title: 'Level 5 - Metadata Tampering',
    description: 'Examine the photo parameters to find the suspicious altered field (DateTimeOriginal).',
    fileName: 'image.jpg',
    downloadHref: '/challenge-files/level5/image.jpg',
    expectedHash: '6e4b8c7bf0c13cb9457bf6549a71a7ccb8a060e1de5858f5676372d7c1890bb1',
    difficulty: 'Medium ⭐⭐⭐',
    hint1: 'Check camera details and capture times using "exiftool image.jpg".',
    hint2: 'Cross-reference the release date of the camera model (Canon EOS R5) vs. the original photo timestamp.',
    hint3: 'The camera was released in 2020, but the timestamp is 2018. The altered field name is the codeword.',
  },
  {
    id: 6,
    title: 'Level 6 - Hidden XMP Metadata',
    description: 'Inspect the image for hidden XMP namespace description segments.',
    fileName: 'image.jpg',
    downloadHref: '/challenge-files/level6/image.jpg',
    expectedHash: '4cf8026ff55d222bc54c23a5d79434f2a3d8f9aa38d130d327cfb16cd7790543',
    difficulty: 'Medium ⭐⭐⭐',
    hint1: 'Dump XMP metadata specifically using "exiftool -xmp:all image.jpg".',
    hint2: 'Look for XML descriptors and standard description tags.',
    hint3: 'The tag "<dc:description>" contains the codeword in plain text.',
  },
  {
    id: 7,
    title: 'Level 7 - PDF XMP Metadata',
    description: 'Extract hidden XMP tags from a PDF metadata stream block.',
    fileName: 'document.pdf',
    downloadHref: '/challenge-files/level7/document.pdf',
    expectedHash: 'b761f57ca9a6cc85b530cacd5c1e9fa45d3148749d6eea20f56a1beccb1a9e01',
    difficulty: 'Medium ⭐⭐⭐',
    hint1: 'Examine PDF streams and resources. Run "strings document.pdf | grep -i xmp".',
    hint2: 'Inspect custom XML schema containers inside the PDF metadata stream.',
    hint3: 'Look for the tag "<xmp:Codeword>", which wraps the secret codeword.',
  },
  {
    id: 8,
    title: 'Level 8 - Metadata Investigation',
    description: 'Examine a conference photo to find the name of the GPS location in uppercase (Stephansplatz).',
    fileName: 'conference_photo.jpg',
    downloadHref: '/challenge-files/level8/conference_photo.jpg',
    expectedHash: '13fcb8bdf09fec67a0c9e9a3742df84bf59d2b79845e231c8eccfb8f7573c614',
    difficulty: 'Hard ⭐⭐⭐⭐',
    hint1: 'Run "exiftool conference_photo.jpg" to retrieve the GPS coordinates.',
    hint2: 'Plugging the latitude (48.2081) and longitude (16.3738) into a map search reveals the spot in Vienna.',
    hint3: 'The coordinates point to a famous central plaza. The codeword is the uppercase name of this square.',
  },
  {
    id: 9,
    title: 'Level 9 - Privacy Risk Assessment',
    description: 'Analyze the employee PDF CV and image inside the ZIP to locate the leak codeword.',
    fileName: 'evidence.zip',
    downloadHref: '/challenge-files/level9/evidence.zip',
    expectedHash: 'fba038d2410b87470dbd4e88d823b5af4d1f353d0a1a98e7af003ee7191ca28f',
    difficulty: 'Hard ⭐⭐⭐⭐',
    hint1: 'Unzip the folder and audit "employee_cv.pdf" using metadata tools.',
    hint2: 'Look for standard document metadata properties like author or creator.',
    hint3: 'The PDF "Author" property contains the codeword: "PRIVACY_FIRST".',
  },
  {
    id: 10,
    title: 'Level 10 - Metadata Cleanup',
    description: 'Recover the codeword and completely sanitize the photo to complete the lab.',
    fileName: 'photo.jpg',
    downloadHref: '/challenge-files/level10/photo.jpg',
    expectedHash: 'e27d332bf7bfc0dd4eb0f4b02a51ff3ad3329397597a819b41b53698664d2d43',
    difficulty: 'Hard ⭐⭐⭐⭐',
    hint1: 'Check the image headers with "exiftool photo.jpg". The description holds a Base64 string.',
    hint2: 'Base64 decode "Q0xFQU5VUA==" to find the codeword.',
    hint3: 'Run "exiftool -all= photo.jpg" to strip all metadata, and upload the sanitized version.',
  },
  {
    id: 11,
    title: 'Bonus - Find the Leak',
    description: 'Triage the files inside the ZIP to identify which file contains the leak.',
    fileName: 'evidence.zip',
    downloadHref: '/challenge-files/bonus/evidence.zip',
    expectedHash: 'f7498688223243ac0e0c28989e022780735a5e43f544c6d3d523ed84f0a9e42b',
    difficulty: 'Hard ⭐⭐⭐⭐',
    hint1: 'Unzip the folder. Check both "holiday.jpg" and "document.pdf" metadata.',
    hint2: 'The image is clean. The PDF contains a hex-encoded keyword.',
    hint3: 'Hex decode the keywords value "424F4E55535F4C45414B" to find the bonus codeword.',
  },
];

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function App() {
  const [solvedFlags, setSolvedFlags] = useState(() => {
    try {
      const saved = localStorage.getItem('ctf_solved_flags');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const flags = {};
    LEVELS.forEach((l) => { flags[l.id] = false; });
    return flags;
  });

  const [completedFlags, setCompletedFlags] = useState(() => {
    try {
      const saved = localStorage.getItem('ctf_completed_flags');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const flags = {};
    LEVELS.forEach((l) => { flags[l.id] = false; });
    return flags;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('ctf_reports');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const reps = {};
    LEVELS.forEach((l) => {
      reps[l.id] = { suspiciousFields: '', interpretation: '', codeword: '' };
    });
    reps.bonus = '';
    return reps;
  });

  const [currentLevel, setCurrentLevel] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/level/')) {
      const id = parseInt(hash.replace('#/level/', ''), 10);
      return id || null;
    }
    return null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/level/')) {
        const id = parseInt(hash.replace('#/level/', ''), 10);
        setCurrentLevel(id || null);
      } else {
        setCurrentLevel(null);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('ctf_solved_flags', JSON.stringify(solvedFlags));
  }, [solvedFlags]);

  useEffect(() => {
    localStorage.setItem('ctf_completed_flags', JSON.stringify(completedFlags));
  }, [completedFlags]);

  useEffect(() => {
    localStorage.setItem('ctf_reports', JSON.stringify(reports));
  }, [reports]);

  const triggerConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#00f2fe', '#4aa3ff', '#10b981', '#ff9f0a', '#f43f5e'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      particles.forEach((p) => {
        if (p.alpha > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25;
          p.alpha -= p.decay;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          ctx.restore();
        }
      });
      if (active) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  };

  async function handleSolved(levelId, answer) {
    const cleanAnswer = answer.trim().toUpperCase();
    const inputHash = await sha256(cleanAnswer);
    const levelInfo = LEVELS.find((l) => l.id === levelId);

    if (levelInfo && inputHash === levelInfo.expectedHash) {
      setSolvedFlags((current) => {
        if (current[levelId]) return current;
        return { ...current, [levelId]: true };
      });
      setReports((prev) => ({
        ...prev,
        [levelId]: { ...prev[levelId], codeword: cleanAnswer },
      }));
      setTimeout(() => {
        triggerConfetti();
      }, 100);
      return true;
    }
    return false;
  }

  function handleRemediated(levelId) {
    setCompletedFlags((current) => {
      if (current[levelId]) return current;
      return { ...current, [levelId]: true };
    });
    setTimeout(() => {
      triggerConfetti();
    }, 100);
  }

  const completedCount = Object.values(completedFlags).filter(Boolean).length;

  const statuses = {};
  LEVELS.forEach((l) => {
    statuses[l.id] = completedFlags[l.id]
      ? 'completed'
      : solvedFlags[l.id]
      ? 'solved'
      : 'unlocked';
  });

  const handleExportReport = () => {
    const markdown = `# Metadata Forensics Lab Report
Generated on: ${new Date().toLocaleString()}

${LEVELS.map((level) => {
  const rep = reports[level.id] || {};
  return `## Level ${level.id} - ${level.title}
- **Evidence Asset**: ${level.fileName}
- **Suspicious Fields**: ${rep.suspiciousFields || 'Not documented'}
- **Forensic Interpretation**: ${rep.interpretation || 'Not documented'}
- **Final Codeword**: ${rep.codeword || 'Not solved'} (Status: ${completedFlags[level.id] ? 'Investigated & Sanitized' : solvedFlags[level.id] ? 'Solved (Needs Sanitization)' : 'Unsolved'})
`;
}).join('\n')}
## Bonus Question
**What pattern suggests the files came from the same workflow or event?**
${reports.bonus || 'Not answered'}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'metadata_forensics_report.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeLevel = LEVELS.find((l) => l.id === currentLevel);

  return (
    <main className="app-shell">
      <canvas id="confetti-canvas" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="hero">
        <div className="hero-title-area">
          <a href="#/" className="home-logo-link">
            <p className="eyebrow">Browser-only forensic lab</p>
            <h1>Metadata Forensics Challenge</h1>
          </a>
          <p className="hero-copy">
            Treat each file as evidence. Recover the hidden metadata, write down the suspicious fields, verify the codeword, and sanitize the files to secure the environment.
          </p>
        </div>
        <div className="progress-card">
          <span>Progress</span>
          <strong>{completedCount}/{LEVELS.length} operations completed</strong>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${(completedCount / LEVELS.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {currentLevel && activeLevel ? (
        <LevelCard
          level={activeLevel}
          status={statuses[activeLevel.id]}
          unlocked={true}
          onSolved={handleSolved}
          onRemediated={handleRemediated}
          report={reports[activeLevel.id]}
          updateReport={(fields) => setReports(prev => ({
            ...prev,
            [activeLevel.id]: { ...prev[activeLevel.id], ...fields }
          }))}
        />
      ) : (
        <Home
          levels={LEVELS}
          statuses={statuses}
          completedCount={completedCount}
        />
      )}

      {completedCount === LEVELS.length && (
        <section className="bonus-report-section">
          <h2>Bonus Analysis Task</h2>
          <p className="bonus-description">
            Compare the files as a set and answer: what pattern suggests the files came from the same workflow or event?
          </p>
          <textarea
            placeholder="Type your explanation here..."
            value={reports.bonus}
            onChange={(e) => setReports(prev => ({ ...prev, bonus: e.target.value }))}
          />
        </section>
      )}

      <div className="global-actions">
        <button
          type="button"
          className="export-report-btn"
          onClick={handleExportReport}
        >
          📄 Export Lab Report (.md)
        </button>
      </div>

      <button
        type="button"
        className="fab-decoder-btn"
        onClick={() => setDrawerOpen(true)}
        title="Open Forensic Decoder Toolbox"
      >
        🛠️ Decoders
      </button>

      <DecoderDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </main>
  );
}
