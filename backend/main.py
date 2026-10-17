import os
import io
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Optional file parsers
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    import docx
except ImportError:
    docx = None

app = FastAPI(title="SkillBridge AI - Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Curated Roles Database
# ---------------------------------------------------------
ROLES_DB: List[Dict[str, Any]] = [
    {
        "id": "data-analyst",
        "title": "Data Analyst",
        "tag": "Insight & reporting",
        "description": "Turn business data into decisions using analysis, dashboards, SQL and clear storytelling.",
        "required": ["python", "sql", "excel", "statistics", "power bi"],
        "recommended": ["pandas", "tableau", "communication"],
    },
    {
        "id": "data-scientist",
        "title": "Data Scientist",
        "tag": "Models & discovery",
        "description": "Explore complex datasets and build predictive models that create measurable value.",
        "required": ["python", "statistics", "machine learning", "sql", "pandas"],
        "recommended": ["scikit-learn", "data visualization", "deep learning"],
    },
    {
        "id": "machine-learning-engineer",
        "title": "Machine Learning Engineer",
        "tag": "Production ML",
        "description": "Build, evaluate and deploy reliable machine learning systems from data to production.",
        "required": ["python", "machine learning", "scikit-learn", "sql", "git"],
        "recommended": ["docker", "cloud", "mlops"],
    },
    {
        "id": "ai-engineer",
        "title": "AI Engineer",
        "tag": "Applied intelligence",
        "description": "Design practical AI products by combining software engineering, models, evaluation and responsible AI.",
        "required": ["python", "machine learning", "apis", "git", "data structures"],
        "recommended": ["llms", "docker", "cloud"],
    },
    {
        "id": "frontend-developer",
        "title": "Frontend Developer",
        "tag": "Digital experiences",
        "description": "Create accessible, responsive interfaces with modern JavaScript frameworks and thoughtful interaction.",
        "required": ["html", "css", "javascript", "react", "git"],
        "recommended": ["typescript", "testing", "accessibility"],
    },
    {
        "id": "backend-developer",
        "title": "Backend Developer",
        "tag": "Systems & APIs",
        "description": "Build secure APIs and services that power reliable digital products and data flows.",
        "required": ["python", "apis", "sql", "git", "data structures"],
        "recommended": ["fastapi", "docker", "cloud"],
    },
    {
        "id": "full-stack-developer",
        "title": "Full Stack Developer",
        "tag": "End-to-end builder",
        "description": "Ship complete product experiences across frontend, backend, databases and deployment.",
        "required": ["html", "css", "javascript", "react", "python", "sql"],
        "recommended": ["apis", "docker", "testing"],
    },
    {
        "id": "cybersecurity-analyst",
        "title": "Cybersecurity Analyst",
        "tag": "Trust & defense",
        "description": "Monitor systems, investigate threats and improve security controls across an organization.",
        "required": ["networking", "linux", "cybersecurity", "python", "risk assessment"],
        "recommended": ["siem", "cloud", "incident response"],
    },
    {
        "id": "cloud-engineer",
        "title": "Cloud Engineer",
        "tag": "Scalable infrastructure",
        "description": "Design and operate resilient cloud services, automation and deployment foundations.",
        "required": ["linux", "cloud", "networking", "python", "docker"],
        "recommended": ["kubernetes", "terraform", "security"],
    },
    {
        "id": "devops-engineer",
        "title": "DevOps Engineer",
        "tag": "Delivery systems",
        "description": "Make software delivery faster and safer through automation, observability and collaboration.",
        "required": ["linux", "git", "docker", "ci/cd", "cloud"],
        "recommended": ["kubernetes", "terraform", "python"],
    },
    {
        "id": "ui-ux-designer",
        "title": "UI/UX Designer",
        "tag": "Human-centered design",
        "description": "Research, prototype and refine intuitive digital products that help people accomplish goals.",
        "required": ["figma", "user research", "wireframing", "prototyping", "communication"],
        "recommended": ["design systems", "accessibility", "usability testing"],
    },
    {
        "id": "qa-automation-engineer",
        "title": "QA Automation Engineer",
        "tag": "Quality at scale",
        "description": "Protect product quality with test strategy, automation and continuous feedback.",
        "required": ["testing", "python", "selenium", "apis", "git"],
        "recommended": ["ci/cd", "javascript", "pytest"],
    },
]

# Skill Aliases Mapping
SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "nlp": "natural language processing",
    "postgres": "sql",
    "mysql": "sql",
    "sqlite": "sql",
    "powerbi": "power bi",
    "k8s": "kubernetes",
    "aws": "cloud",
    "gcp": "cloud",
    "azure": "cloud",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
}

def normalize_skill(skill: str) -> str:
    cleaned = skill.strip().lower()
    return SKILL_ALIASES.get(cleaned, cleaned)


# ---------------------------------------------------------
# In-Memory State (Demo Profile & Roadmap)
# ---------------------------------------------------------
current_profile = {
    "name": "Aarav Sharma",
    "education": "B.Tech Computer Science",
    "specialization": "Computer Science",
    "technical_skills": ["python", "sql"],
    "soft_skills": ["communication", "problem solving"],
    "interests": ["data science", "web development"],
    "certifications": [],
    "projects": ["Sales Data Analysis"],
    "experience_level": "Early career",
    "preferred_industry": "Technology",
    "target_role": "Data Analyst",
    "weekly_hours": 8,
    "key": "demo",
    "updated_at": datetime.now(timezone.utc).isoformat(),
}

current_roadmap = {
    "key": "demo",
    "role": "Data Analyst",
    "role_id": "data-analyst",
    "weeks": 4,
    "tasks": [
        {
            "week": 1,
            "objective": "Build confidence with Excel",
            "topics": ["excel", "guided practice", "reflection notes"],
            "exercise": "Create a small Data Analyst artifact using excel.",
            "milestone": False,
            "completed": False,
        },
        {
            "week": 2,
            "objective": "Build confidence with Power Bi",
            "topics": ["power bi", "guided practice", "reflection notes"],
            "exercise": "Create a small Data Analyst artifact using power bi.",
            "milestone": False,
            "completed": False,
        },
        {
            "week": 3,
            "objective": "Build confidence with Statistics",
            "topics": ["statistics", "guided practice", "reflection notes"],
            "exercise": "Create a small Data Analyst artifact using statistics.",
            "milestone": False,
            "completed": False,
        },
        {
            "week": 4,
            "objective": "Build confidence with Communication",
            "topics": ["communication", "guided practice", "reflection notes"],
            "exercise": "Create a small Data Analyst artifact using communication.",
            "milestone": True,
            "completed": False,
        },
    ],
    "created_at": datetime.now(timezone.utc).isoformat(),
}


# ---------------------------------------------------------
# Models
# ---------------------------------------------------------
class ProfileUpdate(BaseModel):
    name: Optional[str] = "Aarav Sharma"
    education: Optional[str] = ""
    specialization: Optional[str] = ""
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    interests: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    projects: List[str] = []
    experience_level: Optional[str] = "Early career"
    preferred_industry: Optional[str] = "Technology"
    target_role: Optional[str] = "Data Analyst"
    weekly_hours: Optional[int] = 8

class MentorRequest(BaseModel):
    message: str

class InterviewRequest(BaseModel):
    role: str = "Data Analyst"
    difficulty: str = "Beginner"
    category: str = "Technical"
    answer: str


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.get("/api/profile")
def get_profile():
    return current_profile

@app.put("/api/profile")
def update_profile(data: ProfileUpdate):
    global current_profile
    update_dict = data.dict(exclude_unset=True)
    current_profile.update(update_dict)
    current_profile["updated_at"] = datetime.now(timezone.utc).isoformat()
    return current_profile

@app.get("/api/roles")
def get_roles():
    return ROLES_DB

@app.get("/api/recommendations")
def get_recommendations():
    user_skills = set(normalize_skill(s) for s in current_profile.get("technical_skills", []))
    user_soft = set(normalize_skill(s) for s in current_profile.get("soft_skills", []))
    all_user_skills = user_skills.union(user_soft)
    user_projects = " ".join(current_profile.get("projects", []))
    user_text = f"{' '.join(all_user_skills)} {user_projects} {current_profile.get('specialization', '')} {current_profile.get('education', '')}"

    role_corpus = []
    for r in ROLES_DB:
        role_text = f"{r['title']} {r['tag']} {r['description']} {' '.join(r['required'])} {' '.join(r['recommended'])}"
        role_corpus.append(role_text)

    # Calculate TF-IDF & Cosine Similarity
    vectorizer = TfidfVectorizer()
    all_texts = [user_text] + role_corpus
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    results = []
    for i, role in enumerate(ROLES_DB):
        req_norm = [normalize_skill(s) for s in role["required"]]
        matched = [s for s in role["required"] if normalize_skill(s) in all_user_skills]
        missing = [s for s in role["required"] if normalize_skill(s) not in all_user_skills]
        recommended_matched = [s for s in role["recommended"] if normalize_skill(s) in all_user_skills]

        # Combine TF-IDF similarity with skill coverage
        coverage_score = (len(matched) / max(1, len(req_norm))) * 100
        nlp_score = float(similarities[i]) * 100
        
        # Weighted hybrid score
        final_score = int(round(0.6 * coverage_score + 0.4 * nlp_score))
        final_score = max(5, min(98, final_score))

        results.append({
            "id": role["id"],
            "title": role["title"],
            "tag": role["tag"],
            "description": role["description"],
            "required": role["required"],
            "recommended": role["recommended"],
            "score": final_score,
            "matched_skills": matched + recommended_matched,
            "missing_skills": missing,
            "recommended_skills": role["recommended"],
            "methodology": "TF-IDF vectorization + cosine similarity, supported by normalized skill coverage",
        })

    # Sort descending by score
    results.sort(key=lambda x: x["score"], reverse=True)
    return results

@app.get("/api/gap/{role_id}")
def get_gap(role_id: str):
    role = next((r for r in ROLES_DB if r["id"] == role_id), None)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    user_skills = set(normalize_skill(s) for s in current_profile.get("technical_skills", []))
    user_soft = set(normalize_skill(s) for s in current_profile.get("soft_skills", []))
    all_user = user_skills.union(user_soft)

    possessed = []
    missing = []
    for s in role["required"]:
        if normalize_skill(s) in all_user:
            possessed.append(s)
        else:
            missing.append(s)

    coverage = int(round((len(possessed) / max(1, len(role["required"]))) * 100))

    return {
        "role": role,
        "possessed": possessed,
        "missing": missing,
        "additional": role["recommended"],
        "coverage": coverage,
        "methodology": "Case-insensitive normalized skill matching with aliases (JS -> JavaScript).",
    }

@app.get("/api/roadmap")
def get_current_roadmap():
    return current_roadmap

@app.post("/api/roadmap")
def generate_roadmap(role_id: str = Form(...), weeks: int = Form(8)):
    global current_roadmap
    role = next((r for r in ROLES_DB if r["id"] == role_id), ROLES_DB[0])
    
    user_skills = set(normalize_skill(s) for s in current_profile.get("technical_skills", []))
    missing = [s for s in role["required"] + role["recommended"] if normalize_skill(s) not in user_skills]
    if not missing:
        missing = role["required"] + role["recommended"]

    tasks = []
    for w in range(1, weeks + 1):
        skill_focus = missing[(w - 1) % len(missing)]
        tasks.append({
            "week": w,
            "objective": f"Build confidence with {skill_focus.title()}",
            "topics": [skill_focus, "guided practice", "reflection notes"],
            "exercise": f"Create a small {role['title']} artifact using {skill_focus}.",
            "milestone": (w == weeks or w % 4 == 0),
            "completed": False,
        })

    current_roadmap = {
        "key": "demo",
        "role": role["title"],
        "role_id": role["id"],
        "weeks": weeks,
        "tasks": tasks,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return current_roadmap

@app.post("/api/resume/analyze")
async def analyze_resume(file: UploadFile = File(...), job_description: str = Form("")):
    content = await file.read()
    filename = file.filename.lower()
    text = ""

    # Parse text from file
    if filename.endswith(".pdf") and PdfReader:
        try:
            reader = PdfReader(io.BytesIO(content))
            text = " ".join([page.extract_text() or "" for page in reader.pages])
        except Exception:
            text = content.decode("utf-8", errors="ignore")
    elif filename.endswith(".docx") and docx:
        try:
            doc = docx.Document(io.BytesIO(content))
            text = " ".join([p.text for p in doc.paragraphs])
        except Exception:
            text = content.decode("utf-8", errors="ignore")
    else:
        text = content.decode("utf-8", errors="ignore")

    text_lower = text.lower()
    
    # Check Section Completeness
    sections = {
        "summary": bool(re.search(r"\b(summary|objective|profile|about)\b", text_lower)),
        "experience": bool(re.search(r"\b(experience|employment|work history|internship)\b", text_lower)),
        "education": bool(re.search(r"\b(education|university|college|degree|b\.tech|b\.s|bachelor)\b", text_lower)),
        "skills": bool(re.search(r"\b(skills|technical skills|competencies|technologies)\b", text_lower)),
        "projects": bool(re.search(r"\b(projects|academic projects|portfolio)\b", text_lower)),
    }

    # Extract Identified Skills from comprehensive catalog
    all_catalog_skills = [
        "python", "sql", "excel", "power bi", "tableau", "statistics", "machine learning",
        "scikit-learn", "deep learning", "pandas", "numpy", "html", "css", "javascript",
        "react", "typescript", "apis", "git", "data structures", "fastapi", "docker",
        "kubernetes", "linux", "cloud", "aws", "networking", "cybersecurity", "figma"
    ]
    identified = [s for s in all_catalog_skills if re.search(rf"\b{re.escape(s)}\b", text_lower)]

    # Calculate Relevance Score
    base_score = 45
    section_score = sum(10 for v in sections.values() if v)
    skill_score = min(25, len(identified) * 5)
    
    jd_bonus = 0
    if job_description:
        jd_words = set(re.findall(r"\w{3,}", job_description.lower()))
        resume_words = set(re.findall(r"\w{3,}", text_lower))
        overlap = len(jd_words.intersection(resume_words))
        jd_bonus = min(20, overlap * 2)

    total_score = min(95, base_score + (section_score // 2) + skill_score + jd_bonus)

    suggestions = []
    if not sections["projects"]:
        suggestions.append("Add a dedicated Projects section showcasing practical artifacts and tools used.")
    if not sections["summary"]:
        suggestions.append("Include a 2-line Professional Summary highlighting your career intent and core stack.")
    if len(identified) < 4:
        suggestions.append("Clearly list core technical competencies (e.g., Python, SQL, Git) with demonstrable context.")
    if job_description and jd_bonus < 8:
        suggestions.append("Incorporate more keywords directly from the target job posting into your experience bullet points.")
    if not suggestions:
        suggestions.append("Quantify your project outcomes using metrics (e.g., 'reduced processing time by 30%').")

    return {
        "relevance_score": total_score,
        "identified_skills": identified if identified else ["General Tech Skills"],
        "sections": sections,
        "suggestions": suggestions,
    }

@app.post("/api/mentor")
def mentor_chat(data: MentorRequest):
    q = data.message.lower().strip()
    target_role = current_profile.get("target_role", "Data Analyst")
    hours = current_profile.get("weekly_hours", 8)
    name = current_profile.get("name", "there").split()[0]

    # Grounded intelligent responses based on student context
    if "roadmap" in q or "learn next" in q or "start" in q:
        ans = (
            f"Hi {name}! For your target role as a **{target_role}**, here is a focused starting sequence:\n\n"
            f"1. **Core Language & Querying**: Solidify foundational SQL and Python for real data manipulation.\n"
            f"2. **Evidence Projects**: Dedicate {hours} hours/week to building 1 tangible artifact rather than taking multiple passive tutorials.\n"
            f"3. **Milestone Check**: Check the **Learning Roadmap** tab to generate your custom week-by-week timeline!"
        )
    elif "resume" in q or "cv" in q:
        ans = (
            f"When tailoring your resume for **{target_role}** roles:\n"
            f"- Lead with a clear skills matrix (languages, tools, libraries).\n"
            f"- Format each project with Context -> Action -> Result (e.g. 'Analyzed 50k sales records using SQL and built a Power BI dashboard').\n"
            f"- Use our **Resume Lab** to test your resume text against any target role description!"
        )
    elif "interview" in q or "question" in q:
        ans = (
            f"For **{target_role}** interviews, practice explaining technical decisions out loud.\n"
            f"Head over to our **Interview Prep** tab to practice common technical scenario questions and receive structured coaching feedback!"
        )
    else:
        ans = (
            f"Hello {name}! I'm here to support your career journey toward becoming a **{target_role}**.\n\n"
            f"Feel free to ask me:\n"
            f"- How to structure your **{hours} hours/week** study schedule\n"
            f"- Recommended beginner and portfolio projects for **{target_role}**\n"
            f"- Guidance on closing your highest priority skill gaps\n"
            f"- Technical interview preparation tips"
        )

    return {"answer": ans, "mode": "grounded AI"}

@app.post("/api/interview/feedback")
def interview_feedback(data: InterviewRequest):
    ans = data.answer.strip()
    word_count = len(ans.split())

    if word_count < 10:
        score = 42
        feedback = "Your answer is too brief. Try following the STAR or CAR framework: describe the Context, your specific Action/Approach, the Result, and your Reflection."
    elif word_count < 35:
        score = 68
        feedback = f"Good initial foundation for {data.role}. To strengthen this response, mention specific tools (e.g. SQL joins, Python pandas, API error handling) and quantify the outcome."
    else:
        score = 88
        feedback = f"Strong and articulate response! You demonstrated good technical reasoning and structure appropriate for an early-career {data.role} position."

    return {
        "question": f"Explain a {data.role} concept you recently practiced.",
        "feedback": feedback,
        "score": score,
        "note": "Practice feedback is directional, not an employability prediction.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
