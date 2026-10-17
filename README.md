# SkillBridge AI — Career Readiness Studio

> **AI Career Studio supporting UN Sustainable Development Goal 8 (Decent Work & Economic Growth)**  
> Full-stack web application designed to help students and early-career job seekers navigate career readiness with explainable ML signals, actionable skill gap analysis, personalized roadmaps, resume scanning, and AI interview prep.

---

## 🚀 Features

1. **Dashboard & Signal Overview**:
   - Dynamic profile readiness meter & progress ring
   - Top career match indicator with relative match score
   - Real-time roadmap milestone tracking & next steps pulse
   - Key ML metrics explainability card (TF-IDF + Cosine similarity)

2. **Profile & Skills Management**:
   - Academic background, specialization, target role, and preferred industry
   - Weekly study hour commitments
   - Tagged technical skills, soft skills, and portfolio projects

3. **Career Matches & Intelligence**:
   - Explainable ML baseline using **TF-IDF Vectorization** and **Cosine Similarity**
   - Matches profile narrative and skills against 12 curated tech roles
   - Tagged matched skills (`✓`) and priority missing skills (`+`)

4. **Skill Gap Analyzer**:
   - In-depth gap breakdown across 12 roles:
     - **You have** (Recognized essential skills)
     - **Priority next** (Missing required skills)
     - **Level up later** (Recommended bonus skills)
   - Visual percentage coverage meter

5. **Resume Lab**:
   - In-memory PDF / DOCX resume text extraction
   - Keyword relevance comparison against custom job descriptions
   - Section completeness audit (Summary, Experience, Education, Skills, Projects)
   - Practical, actionable resume improvement suggestions

6. **Learning Roadmap**:
   - 4, 8, or 12-week focused learning plans
   - Structured week-by-week objectives, focus topics, and practical portfolio artifact exercises
   - Checkpoint milestones

7. **AI Career Mentor**:
   - Interactive chat assistant grounded in the user's profile, study hours, and target role
   - Actionable study advice, resume tips, and project recommendations

8. **Interview Simulator**:
   - Role-specific technical practice questions
   - Structured response evaluation following STAR/CAR frameworks
   - Directional practice score (0–100) and actionable coaching notes

9. **Progress Analytics & Documentation**:
   - 5-dimensional skill growth chart (Profile, Skills, Resume, Roadmap, Practice)
   - Concept notes and Lean Canvas product strategy

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Lucide React Icons, Axios, TanStack React Query, Custom CSS Design System
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Scikit-learn (TF-IDF & Cosine Similarity), Pydantic v2, PyPDF, python-docx

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher) & `npm`
- **Python** (v3.10 or higher) & `pip`

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

```bash
cd frontend

# Install npm packages
npm install

# Start development server
npm start
```

The web app will open automatically at `http://localhost:3000`.

---

## 📂 Project Structure

```
skillbridge-ai/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Core application components & router
│   │   ├── App.css        # Studio design tokens & component styles
│   │   ├── drawer.css     # Responsive navigation drawer
│   │   ├── index.css      # Base typography & color variables
│   │   └── index.js       # React root mount
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── main.py            # FastAPI endpoints, TF-IDF engine & resume parser
│   ├── requirements.txt   # Python dependencies
│   └── .env.example
└── README.md
```
