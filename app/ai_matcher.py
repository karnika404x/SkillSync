import json
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models import User, Project
from app.schemas import (
    MatchExplanation, MatchScoreComponent, TalentMatchResult,
    EmployeeResponse, HiddenTalentCandidate, UpskillingItem
)

class AISkillMatcher:
    """
    Explainable AI Skill Matching Engine for SkillSync.
    Combines exact skill overlap, TF-IDF vector text similarity, 
    experience weighting, interest alignment, and employee performance metrics.
    """

    @staticmethod
    def _parse_json_list(val: Any) -> List[str]:
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            try:
                parsed = json.loads(val)
                if isinstance(parsed, list):
                    return [str(x) for x in parsed]
            except Exception:
                # Fallback to comma separation
                return [s.strip() for s in val.split(",") if s.strip()]
        return []

    @classmethod
    def calculate_match(cls, employee: User, project: Project) -> MatchExplanation:
        emp_skills = cls._parse_json_list(employee.skills)
        emp_interests = cls._parse_json_list(employee.interests)
        req_skills = cls._parse_json_list(project.required_skills)

        emp_skills_lower = [s.lower() for s in emp_skills]
        req_skills_lower = [s.lower() for s in req_skills]

        # 1. Exact / Substring Skill Overlap
        hits = []
        missing = []
        for orig_req, req_l in zip(req_skills, req_skills_lower):
            matched = any(
                req_l in s or s in req_l for s in emp_skills_lower
            )
            if matched:
                hits.append(orig_req)
            else:
                missing.append(orig_req)

        skill_overlap_ratio = (len(hits) / len(req_skills)) if req_skills else 1.0
        skill_overlap_score = round(skill_overlap_ratio * 50.0, 2)  # Max 50 points

        # 2. TF-IDF Vector Cosine Similarity
        emp_doc = f"{employee.job_title} {employee.department} {' '.join(emp_skills)} {' '.join(emp_interests)}"
        proj_doc = f"{project.title} {project.department} {project.description} {' '.join(req_skills)}"

        try:
            vectorizer = TfidfVectorizer().fit([emp_doc, proj_doc])
            vectors = vectorizer.transform([emp_doc, proj_doc])
            cos_sim = float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
        except Exception:
            cos_sim = 0.0

        vector_similarity_score = round(cos_sim * 15.0, 2)  # Max 15 points

        # 3. Experience Score
        exp_ratio = min((employee.experience_years or 0) / 5.0, 1.0)
        experience_score = round(exp_ratio * 15.0, 2)  # Max 15 points

        # 4. Interest & Department Alignment
        interest_aligned = False
        for interest in emp_interests:
            interest_l = interest.lower()
            if any(interest_l in s or s in interest_l for s in req_skills_lower) or interest_l in project.department.lower():
                interest_aligned = True
                break

        interest_score = 10.0 if interest_aligned else 0.0  # Max 10 points

        # 5. Performance / Knowledge Score
        knowledge_factor = ((employee.knowledge_score or 75) + (employee.recommendation_score or 75)) / 200.0
        performance_score = round(knowledge_factor * 10.0, 2)  # Max 10 points

        # Overall aggregate score
        total_raw = skill_overlap_score + vector_similarity_score + experience_score + interest_score + performance_score
        final_score = min(99, max(10, round(total_raw)))

        # Status Label
        if len(missing) == 0:
            status_label = "Strong match"
        elif final_score >= 50:
            status_label = "Partial match"
        else:
            status_label = "Skill gap"

        components = MatchScoreComponent(
            skill_overlap_score=skill_overlap_score,
            vector_similarity_score=vector_similarity_score,
            experience_score=experience_score,
            interest_score=interest_score,
            performance_score=performance_score
        )

        return MatchExplanation(
            score=final_score,
            status_label=status_label,
            hits=hits,
            missing=missing,
            interest_aligned=interest_aligned,
            components=components
        )

    @classmethod
    def shortlist_candidates(cls, project: Project, employees: List[User], top_n: int = 10) -> List[TalentMatchResult]:
        results = []
        for emp in employees:
            exp = cls.calculate_match(emp, project)
            
            emp_response = EmployeeResponse(
                id=emp.id,
                name=emp.name,
                email=emp.email,
                role=emp.role,
                job_title=emp.job_title,
                department=emp.department,
                experience_years=emp.experience_years,
                skills=cls._parse_json_list(emp.skills),
                interests=cls._parse_json_list(emp.interests),
                hidden_skills=cls._parse_json_list(emp.hidden_skills),
                training_completed=cls._parse_json_list(emp.training_completed),
                knowledge_score=emp.knowledge_score,
                communication_score=emp.communication_score,
                recommendation_score=emp.recommendation_score,
                created_at=emp.created_at
            )
            
            results.append(TalentMatchResult(
                employee=emp_response,
                match_score=exp.score,
                explanation=exp
            ))

        results.sort(key=lambda x: x.match_score, reverse=True)
        return results[:top_n]

    @classmethod
    def discover_hidden_talent(cls, employees: List[User], projects: List[Project]) -> List[HiddenTalentCandidate]:
        candidates = []
        for emp in employees:
            hidden = cls._parse_json_list(emp.hidden_skills)
            skills = cls._parse_json_list(emp.skills)
            
            discoverable = list(set(hidden + [s for s in skills if s.lower() not in emp.job_title.lower()]))
            if not discoverable:
                continue

            matches = []
            for proj in projects:
                exp = cls.calculate_match(emp, proj)
                if exp.score >= 40:
                    matches.append({
                        "project_id": proj.id,
                        "project_title": proj.title,
                        "department": proj.department,
                        "match_score": exp.score
                    })

            emp_response = EmployeeResponse(
                id=emp.id,
                name=emp.name,
                email=emp.email,
                role=emp.role,
                job_title=emp.job_title,
                department=emp.department,
                experience_years=emp.experience_years,
                skills=skills,
                interests=cls._parse_json_list(emp.interests),
                hidden_skills=hidden,
                training_completed=cls._parse_json_list(emp.training_completed),
                knowledge_score=emp.knowledge_score,
                communication_score=emp.communication_score,
                recommendation_score=emp.recommendation_score,
                created_at=emp.created_at
            )

            candidates.append(HiddenTalentCandidate(
                employee=emp_response,
                discoverable_skills=discoverable,
                potential_project_matches=matches
            ))

        return candidates

    @classmethod
    def generate_upskilling_matrix(
        cls, employees: List[User], projects: List[Project], learning_records: Dict[str, str]
    ) -> List[UpskillingItem]:
        matrix = []
        for emp in employees:
            for proj in projects:
                exp = cls.calculate_match(emp, proj)
                for missing_skill in exp.missing:
                    key = f"{emp.id}|{missing_skill}"
                    status = learning_records.get(key, "Not Started")
                    matrix.append(UpskillingItem(
                        employee_id=emp.id,
                        employee_name=emp.name,
                        project_id=proj.id,
                        project_title=proj.title,
                        missing_skill=missing_skill,
                        suggested_action=f"{missing_skill} fundamentals & practical hands-on module",
                        learning_status=status
                    ))
        return matrix
