import pdfplumber
import re
import pandas as pd
from datetime import time
from collections import defaultdict

PDF_PATH = "/content/err.pdf"

# ---------------- REGEX ----------------

COURSE_HEADER = re.compile(r"^(\d{2}[A-Z]{2}\d{3})\s*\[(\d+)\s*Credits\]")
DOMAIN_PATTERN = re.compile(
    r"(PROFESSIONAL CORE|PROFESSIONAL ELECTIVE|OPEN ELECTIVE|ENGINEERING SCIENCES|HUMANITIES AND SCIENCES)"
)
SLOT_FACULTY_PATTERN = re.compile(r"^([A-Z0-9\-]+),\s*(.+)")
DAY_PATTERN = re.compile(r"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday):")
TIME_PAIR_PATTERN = re.compile(r"(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})")

VALID_START = time(8, 0)
VALID_END = time(17, 0)

# ---------------- HELPERS ----------------

def is_valid_time(start, end):
    s = time.fromisoformat(start)
    e = time.fromisoformat(end)
    return VALID_START <= s < e <= VALID_END

def to_minutes(t):
    h, m = map(int, t.split(":"))
    return h * 60 + m

def from_minutes(m):
    return f"{m//60:02d}:{m%60:02d}"

# ---------------- PDF TEXT ----------------

def extract_text(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    return text

# ---------------- PARSER ----------------

def parse_pdf(text):
    rows = []

    current_course = {}
    current_slot = None
    current_faculty = None
    skip_phase = False

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    i = 0

    while i < len(lines):
        line = lines[i]

        # ---- COURSE HEADER ----
        header = COURSE_HEADER.match(line)
        if header:
            current_course = {
                "Course Code": header.group(1),
                "Credits": header.group(2),
                "Course Name": ""
            }
            current_slot = None
            current_faculty = None
            skip_phase = False
            i += 1
            continue

        # ---- IGNORE DOMAIN (NOT STORED) ----
        if DOMAIN_PATTERN.search(line):
            i += 1
            continue

        # ---- COURSE NAME ----
        if line == "Course overview":
            current_course["Course Name"] = lines[i + 1]
            i += 2
            continue

        # ---- IGNORE PHASE ----
        if line.startswith("PHASE"):
            skip_phase = True
            current_slot = None
            current_faculty = None
            i += 1
            continue

        # ---- SLOT + FACULTY ----
        slot_match = SLOT_FACULTY_PATTERN.match(line)
        if slot_match:
            current_slot = slot_match.group(1)
            current_faculty = slot_match.group(2)
            skip_phase = False
            i += 1
            continue

        # ---- DAY + MULTI TIME ----
        day_match = DAY_PATTERN.match(line)
        if day_match and current_course and current_slot and not skip_phase:
            day = day_match.group(1)
            times = TIME_PAIR_PATTERN.findall(line)

            for start, end in times:
                if is_valid_time(start, end):
                    rows.append({
                        "Course Name": current_course["Course Name"],
                        "Course Code": current_course["Course Code"],
                        "Credits": current_course["Credits"],
                        "Faculty Name": current_faculty,
                        "Slot Name": current_slot,
                        "Day": day,
                        "Start": start,
                        "End": end
                    })

        i += 1

    return rows

# ---------------- MERGE CONTINUOUS SLOTS ----------------

def merge_slots(rows):
    grouped = defaultdict(list)

    for r in rows:
        key = (
            r["Course Name"],
            r["Course Code"],
            r["Credits"],
            r["Faculty Name"],
            r["Slot Name"],
            r["Day"]
        )
        grouped[key].append((to_minutes(r["Start"]), to_minutes(r["End"])))

    final = []

    for key, times in grouped.items():
        times.sort()
        start, end = times[0]

        for s, e in times[1:]:
            if s == end:
                end = e
            else:
                final.append((*key, start, end))
                start, end = s, e

        final.append((*key, start, end))

    return final

# ---------------- MAIN ----------------

def main():
    text = extract_text(PDF_PATH)
    raw_rows = parse_pdf(text)
    merged = merge_slots(raw_rows)

    df = pd.DataFrame([
        {
            "Course Name": name,
            "Course Code": code,
            "Credits": credits,
            "Faculty Name": faculty,
            "Slot Name": slot,
            "Day": day,
            "Time": f"{from_minutes(start)} - {from_minutes(end)}"
        }
        for (
            name, code, credits,
            faculty, slot, day,
            start, end
        ) in merged
    ])

    df.to_csv("weekly_timetable.csv", index=False)
    print("✅ Weekly timetable generated (Domain removed)")
    print(df.head(10))

if __name__ == "__main__":
    main()

