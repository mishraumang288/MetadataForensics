# Metadata Forensics Lab

This browser-based challenge models a small digital forensics triage exercise. Players inspect ten levels of files, identify leaked metadata, and recover a codeword from each case.

## Research framing
The challenge is designed for a university setting: it demonstrates how metadata supports provenance analysis, location inference, and operational intelligence gathering even when the visible file content looks harmless.

## Case framing
The materials simulate a low-stakes incident response workflow inside a university environment. A public-facing upload was meant to be harmless, but the embedded metadata creates an evidence trail that a forensic analyst can still reconstruct.

## Learning objectives
- Recognize common metadata sources in images and documents.
- Distinguish visible content from hidden file evidence.
- Explain how a single field can reveal authorship, location, or workflow details.
- Practice evidence-based reasoning rather than guessing from the file name.

## Rules
- Use only the in-browser tools provided by the challenge.
- Do not modify the supplied files.
- Record the suspicious metadata fields in your notes before submitting the codeword.
- Submit each codeword exactly as recovered.

## Scenario
The University of Vienna digital forensics lab receives three files from a mock incident report. A staff member uploaded material for a public event, but the embedded metadata was never stripped. Your task is to reconstruct the leak trail and recover the codeword for each case.

## Suggested answer format for a report
- File name
- Suspicious metadata fields
- One-sentence interpretation
- Final codeword

## Marking rubric
- Evidence identification: 4 points
- Interpretation of suspicious fields: 4 points
- Clarity and structure of report: 2 points
- Bonus reasoning across multiple files: 2 points

## Bonus analysis task
After solving all three levels, compare the files as a set and answer one short question: what pattern suggests the files came from the same workflow or event?

## Hints
- Check comment, author, subject, keyword, creation date, and GPS fields.
- The visible file content is only a decoy; the metadata is the target.
- Some values are encoded or split across multiple fields.

## Player Flow
1. Download the level file.
2. Upload it into the matching level card.
3. Inspect the metadata table for suspicious values.
4. Note the evidence in your report.
5. Enter the recovered codeword to unlock the next level.

## Levels
The main challenge includes 10 numbered levels plus a bonus case.

See `src/App.jsx` for the current level list, file names, hashes, and hints.

## Why this works well for university level
- It is reproducible in a browser without requiring specialist software.
- It rewards observation, explanation, and documentation rather than brute force.
- It introduces authentic forensic concepts: provenance, encoding, and geolocation.
- It can be graded as a short evidence report instead of a pure puzzle race.
