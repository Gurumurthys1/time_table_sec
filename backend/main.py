from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
from backend.extractor import extract_courses
from backend.solver import TimetableCSP
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PlanWiz API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PreferenceRequest(BaseModel):
    selected_subjects: List[str]
    courses_data: List[Dict]
    leave_day: str
    preferred_faculties: Optional[Dict[str, str]] = {}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    contents = await file.read()
    try:
        extracted_data = extract_courses(contents)
        return {"courses": extracted_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@app.post("/api/generate")
def generate_timetable(request: PreferenceRequest):
    solver = TimetableCSP(
        request.selected_subjects,
        request.courses_data,
        request.leave_day,
        request.preferred_faculties
    )
    
    result = solver.solve()
    return result

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
