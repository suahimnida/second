"""API 요청/응답 스키마. 프론트와 공유하는 계약이므로 필드 변경 시 프론트에 공지할 것."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AnalysisRequest(BaseModel):
    url: str = Field(..., examples=["https://example.com"])
    is_public: bool = False  # 공개 목록에 올릴지. 분석 후에는 바꿀 수 없다

    @field_validator("url")
    @classmethod
    def url_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("url이 비어 있습니다.")
        return v


class BlacklistResult(BaseModel):
    matched: bool
    match_type: Literal["none", "exact", "host"]
    source: str


class ModelResult(BaseModel):
    status: Literal["not_connected", "completed", "failed"]
    risk_score: float | None = None
    label: str | None = None


class SimilarCase(BaseModel):
    url: str
    label: int  # 1 = 피싱, 0 = 정상
    similarity: float


class Detections(BaseModel):
    """탐지 항목별 결과. 아직 구현되지 않은 항목은 null."""

    url: dict | None = None
    url_stats: dict | None = None
    domain: dict | None = None
    html: dict | None = None
    image: dict | None = None


class AiAnalysis(BaseModel):
    summary: str | None = None
    reasons: list[str] = []


class AnalysisResponse(BaseModel):
    id: str
    status: Literal["completed", "failed"]
    url: str
    is_public: bool = False
    # 최종 판정: 블랙리스트/모델/RAG를 합치는 규칙이 정해질 때까지 null
    verdict: Literal["phishing", "normal"] | None = None
    confidence: float | None = None
    risk_score: int | None = None
    risk_level: Literal["low", "medium", "high"] | None = None
    detections: Detections = Detections()
    ai_analysis: AiAnalysis = AiAnalysis()
    extracted_features: dict = {}
    similar_cases: list[SimilarCase] = []
    # 프론트 구조에서 자리가 아직 정해지지 않은 값 (합의 후 이동)
    blacklist: BlacklistResult
    model: ModelResult


class AnalysisSummary(BaseModel):
    """목록용 요약. 브라우저 ID(client_id)는 절대 넣지 않는다."""

    id: str
    url: str
    verdict: Literal["phishing", "normal"] | None = None
    created_at: str


class AnalysisListResponse(BaseModel):
    items: list[AnalysisSummary]


class ClientResponse(BaseModel):
    client_id: str


class HealthResponse(BaseModel):
    status: str
