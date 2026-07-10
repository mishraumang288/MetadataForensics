# Facilitator Guide

## Intended outcome
Participants solve three browser-only metadata forensics levels, document the suspicious fields they found, and submit the codewords in order.

## Run
- Install dependencies with `npm install`.
- Start the app with `npm run dev`.
- Open the local Vite URL in the browser.

## Assets
- Level 1: `public/challenge-files/level1/image.jpg`
- Level 2: `public/challenge-files/level2/document.pdf`
- Level 3: `public/challenge-files/level3/photo.png`

## Codewords
- Level 1: `BOROBUDUR`
- Level 2: `PDF_LEAK`
- Level 3: `KUNSTHISTORISCHES_MUSEUM`

## Intended path
- Level 1: inspect EXIF metadata and identify the exposed descriptive field.
- Level 2: inspect PDF metadata and read the embedded document fields.
- Level 3: inspect GPS metadata, note the coordinates, and connect them to a Vienna landmark.

## Teaching point
- Metadata can reveal private, operational, and organizational information even when the visible file content seems harmless.
- Students should be encouraged to explain why a field is suspicious, not only to name the final codeword.

## Suggested grading focus
- Did the participant identify the suspicious field, not just the answer?
- Did they explain the forensic significance of the metadata?
- Did they compare evidence across files when answering the bonus task?

## Optional deliverable
- A short memo or bullet report with the file name, suspicious metadata, interpretation, and final codeword for each level.

## Optional discussion prompts
- Which fields were easiest to exploit, and why?
- How would stripping metadata change the attack surface?
- What extra evidence would you want before using metadata in a real investigation?
