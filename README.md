# Metadata Forensics Lab

This browser-based challenge models a small digital forensics triage exercise. Players inspect ten levels of files, identify leaked metadata, and recover a codeword from each case.

The authoritative challenge description lives in [ChallengeMaterials/Challenge.md](ChallengeMaterials/Challenge.md). If this README differs, follow the challenge file.

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL that appears in the terminal.

## Build

```bash
npm run build
```

## Challenge files
- `public/challenge-files/level1/image.jpg`
- `public/challenge-files/level2/document.pdf`
- `public/challenge-files/level3/photo.png`

## Challenge scope
- Levels 1-10 are the main progression.
- A bonus level is also included for extra analysis.
- The app content and hashes are defined in `src/App.jsx`.


