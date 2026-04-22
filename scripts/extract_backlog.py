from pypdf import PdfReader
import re

reader = PdfReader("ProductBacklog_SIMRS.pdf")
text = []
for page in reader.pages:
    text.append(page.extract_text())
full = "\n".join(filter(None, text))

# Simple regex to find lines that look like IDs e.g., PB-001 or 1.1 or #12
# We'll capture lines with 'ID', 'No', or patterns like PB-\d{3}
pattern = re.compile(r"(PB[-\s]?\d{1,4}|\bID\b[:\s]*\d{1,4}|\bNo\b[:\s]*\d{1,4}|^\d{1,3}\.\d{1,3})", re.I | re.M)

matches = pattern.findall(full)

# Heuristic: split by lines and find lines that contain an ID then a description
lines = full.splitlines()
items = []
for i, line in enumerate(lines):
    m = pattern.search(line)
    if m:
        id_ = m.group(0).strip()
        # description is remainder of line or next line
        desc = line[m.end():].strip()
        if not desc and i+1 < len(lines):
            desc = lines[i+1].strip()
        items.append((id_, desc))

# fallback: if no items found, dump first 500 chars
if not items:
    print(full[:500])
else:
    for id_, desc in items:
        print(f"{id_} — {desc}")
