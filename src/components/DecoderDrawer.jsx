import { useState, useMemo } from 'react';

export default function DecoderDrawer({ isOpen, onClose }) {
  const [b64Input, setB64Input] = useState('');
  const [hexInput, setHexInput] = useState('');
  const [rotInput, setRotInput] = useState('');

  const b64Output = useMemo(() => {
    if (!b64Input.trim()) return '';
    try {
      return atob(b64Input.trim());
    } catch {
      return 'Invalid Base64 string';
    }
  }, [b64Input]);

  const hexOutput = useMemo(() => {
    if (!hexInput.trim()) return '';
    try {
      const clean = hexInput.replace(/\s+/g, '');
      if (clean.length % 2 !== 0) return 'Invalid Hex length';
      let str = '';
      for (let i = 0; i < clean.length; i += 2) {
        const byte = parseInt(clean.substr(i, 2), 16);
        if (isNaN(byte)) return 'Invalid Hex characters';
        str += String.fromCharCode(byte);
      }
      return str;
    } catch {
      return 'Invalid Hex string';
    }
  }, [hexInput]);

  const rotOutput = useMemo(() => {
    if (!rotInput) return '';
    return rotInput.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
    });
  }, [rotInput]);

  return (
    <div className={`decoder-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h3>Forensic Toolset</h3>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close drawer">×</button>
      </div>
      <div className="drawer-content">
        <div className="tool-section">
          <h4>Base64 Decoder</h4>
          <textarea
            placeholder="Paste Base64 here (e.g., Qk9ST0JVRFVS)"
            value={b64Input}
            onChange={(e) => setB64Input(e.target.value)}
          />
          <div className="tool-output">
            <span>Decoded Text:</span>
            <code>{b64Output || '—'}</code>
          </div>
        </div>

        <div className="tool-section">
          <h4>Hex Decoder</h4>
          <textarea
            placeholder="Paste Hex here (e.g., 5044465F4C45414B)"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
          />
          <div className="tool-output">
            <span>Decoded Text:</span>
            <code>{hexOutput || '—'}</code>
          </div>
        </div>

        <div className="tool-section">
          <h4>ROT13 Decoder</h4>
          <textarea
            placeholder="Paste ROT13 here (e.g., XHAFGUVFGBEVFPURF_ZHFRHZ)"
            value={rotInput}
            onChange={(e) => setRotInput(e.target.value)}
          />
          <div className="tool-output">
            <span>Decoded Text:</span>
            <code>{rotOutput || '—'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
