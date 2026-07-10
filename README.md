# Metadata Forensics Lab

This browser-based challenge models a small digital forensics triage exercise. Players inspect three files, identify leaked metadata, and recover a codeword from each case.

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

## Challenge summary
- Level 1: image.jpg, a travel photo with an exposed descriptive field. Codeword: BOROBUDUR.
- Level 2: document.pdf, a document that leaks its provenance in PDF fields. Codeword: PDF_LEAK.
- Level 3: photo.png, a geotagged image that resolves to a Vienna landmark. Codeword: KUNSTHISTORISCHES_MUSEUM.
