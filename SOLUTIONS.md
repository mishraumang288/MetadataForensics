# Metadata Forensics CTF - Walkthrough & Write-up

Here is my walkthrough for the Metadata Forensics lab, covering all 10 main challenges and the bonus leak challenge. I used basic command-line tools like `exiftool` and `pdfinfo` along with simple decoding commands.

---

## Level 1: Sensor Trace
We start with a photo named `image.jpg`. Since it's a travel picture, the first thing to check is standard EXIF tags. 

Run this in your terminal:
```bash
exiftool image.jpg
```

Scanning through the output, you will see a suspicious string in the `ImageDescription` field:
`Qk9ST0JVRFVS`

This looks like standard Base64. You can decode it directly in your terminal:
```bash
echo "Qk9ST0JVRFVS" | base64 -d
# Output: BOROBUDUR
```
The codeword is `BOROBUDUR`.

For the remediation step, you need to strip all metadata from the image before uploading it:
```bash
exiftool -all= image.jpg
```

---

## Level 2: Document Provenance
This level gives us a PDF named `document.pdf`. For PDFs, we can extract basic details using `pdfinfo` or `exiftool`.

Run:
```bash
pdfinfo document.pdf
```

Under the `Keywords` metadata attribute, there's a long hex string:
`5044465F4C45414B`

Convert this hex string to ASCII characters (you can use python or an online hex decoder):
```bash
echo "5044465F4C45414B" | xxd -r -p
# Output: PDF_LEAK
```
The codeword is `PDF_LEAK`.

To clean it, you can run a PDF sanitizer or re-save the PDF using a tool that excludes metadata.

---

## Level 3: Location Reconstruction
We are given a photo called `photo.png`. Let's run `exiftool` to see what is inside:
```bash
exiftool photo.png
```

This photo has active GPS tags:
- `GPS Latitude`: 48 deg 12' 29.16" N (48.208100)
- `GPS Longitude`: 16 deg 22' 25.68" E (16.373800)

If you look up these coordinates, they point to a landmark in Vienna (the Kunsthistorisches Museum).
Additionally, the `Description` field contains an encoded string:
`XHAFGUVFGBEVFPURF_ZHFRHZ`

This is ciphered using ROT13. Rotating the letters by 13 places gives:
`KUNSTHISTORISCHES_MUSEUM` (which matches the museum location).

Submit `KUNSTHISTORISCHES_MUSEUM` as the codeword, then strip the metadata to complete the stage:
```bash
exiftool -all= photo.png
```

---

## Level 4: Metadata Correlation
For this level, we download `evidence.zip`. Unzipping it reveals two assets: `image.jpg` and `report.pdf`. The description asks who created both files.

We inspect the metadata profile for both:
```bash
exiftool image.jpg | grep -E "Artist|Author|Creator"
exiftool report.pdf | grep -E "Artist|Author|Creator"
```

Both files list `Alice` as the creator (`Artist` in the image and `Author` in the PDF).
The codeword is `ALICE`. 

To pass the sanitization stage, clean the metadata from both assets and verify.

---

## Level 5: Metadata Tampering
We are given an image `image.jpg`. The description says the metadata is suspicious. Let's look at the tags:
```bash
exiftool image.jpg
```

We see these fields:
- `Camera Model`: Canon EOS R5
- `Date/Time Original`: 2018:06:15 12:00:00

If you research the Canon EOS R5, you'll find it was released in **2020**. It is physically impossible for a genuine photo taken with that camera to be dated 2018. This shows the date has been forged.
The suspicious metadata field is `DateTimeOriginal`.
The codeword is `DATETIMEORIGINAL`.

Clean the image metadata to complete the level:
```bash
exiftool -all= image.jpg
```

---

## Level 6: Hidden XMP Metadata
This level uses `image.jpg`. Running a normal `exiftool` might not show the flag if it's hidden inside XMP tags. Let's explicitly dump all XMP XML properties:
```bash
exiftool -xmp:all image.jpg
# Or search the raw string streams:
strings image.jpg | grep -i "description"
```

Inside the XMP metadata container, the description field houses the plain-text flag:
`XMP_SECRET`

The codeword is `XMP_SECRET`. Clean the metadata as usual to finish.

---

## Level 7: PDF XMP Metadata
We have `document.pdf`. Unlike previous levels, the flag is not in the standard PDF document info fields. It is stored inside an embedded XMP stream.

Open the PDF in a text editor or search the raw stream:
```bash
strings document.pdf | grep -A 2 -B 2 "Codeword"
```

You will locate the custom XML tags:
`<xmp:Codeword>PDF_XMP_SECRET</xmp:Codeword>`

The codeword is `PDF_XMP_SECRET`.

---

## Level 8: Metadata Investigation
We receive `conference_photo.jpg`. The challenge asks us to find the location name of the GPS coordinates.

Let's extract the GPS tags:
```bash
exiftool -gps:all conference_photo.jpg
```

We get:
- `GPS Latitude`: 48.208100 N
- `GPS Longitude`: 16.373800 E

Plugging these coordinates into a map search reveals they point directly to the **Stephansplatz** square in Vienna.
The codeword is `STEPHANSPLATZ` (in uppercase).

---

## Level 9: Privacy Risk Assessment
We download a zip containing `employee_cv.pdf` and `family_photo.jpg`. The challenge requires us to locate sensitive personal details leaking in metadata.

Inspect the PDF metadata:
```bash
exiftool employee_cv.pdf
```

The PDF `Author` tag leaks:
`PRIVACY_FIRST`

The codeword is `PRIVACY_FIRST`.

---

## Level 10: Metadata Cleanup
We receive `photo.jpg`. We need to extract the codeword and completely sanitize the file.

Let's look at the tags:
```bash
exiftool photo.jpg
```

The `ImageDescription` tag contains the Base64 value:
`Q0xFQU5VUA==`

Decoding it gives `CLEANUP`:
```bash
echo "Q0xFQU5VUA==" | base64 -d
# Output: CLEANUP
```

Submit `CLEANUP`. Then, run `exiftool -all= photo.jpg` to sanitize the file, and upload it to complete the challenge.

---

## Bonus: Find the Leak
We receive `evidence.zip` containing `holiday.jpg` and `document.pdf`.

Triage both files:
- Inspecting `holiday.jpg` shows it is clean and does not contain any flags.
- Inspecting `document.pdf` keywords reveals a hex string:
  `424F4E55535F4C45414B`

Hex decode this string:
```bash
echo "424F4E55535F4C45414B" | xxd -r -p
# Output: BONUS_LEAK
```
The codeword is `BONUS_LEAK`.
