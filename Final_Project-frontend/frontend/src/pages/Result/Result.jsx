import { useEffect } from "react";
import "./Result.css";

const mockResult = {
  id: "8d210232-8d4e-4fe6-98ad-d5e79e65b036",

  url: "https://example.com",
  status: "completed",

  blacklist: {
    matched: true,
    match_type: "exact_url",
    source: "KISA 2024",
  },

  model: {
    status: "not_connected",
    risk_score: null,
    label: null,
  },

  rag: {
    extracted_features: {
      url_length: "suspicious",
      character_pattern: "suspicious",
      entropy: "normal",
      ngram: "suspicious",
    },

    similar_cases: [
      {
        url: "https://example.com",
        similarity: 0.91,
      },
    ],

    ai_analysis: {
      summary:
        "URL 구조와 분석된 특징을 종합했을 때 피싱 사이트와 유사한 특성이 확인되었습니다.",

      reasons: [
        "URL 길이가 비정상적으로 깁니다.",
        "의심스러운 문자 패턴이 발견되었습니다.",
        "유사한 피싱 사례가 확인되었습니다.",
      ],
    },
  },

  completed_steps: [
    "url",
    "url_stats",
    "domain",
    "html",
  ],
};

const detectionLabels = {
  url_length: {
    title: "URL 길이",
    description: "URL 길이가 일반적인 범위를 벗어나는지 확인",
  },
  character_pattern: {
    title: "문자 패턴",
    description: "의심스러운 문자 조합 및 특수문자 패턴 분석",
  },
  entropy: {
    title: "엔트로피",
    description: "URL 문자열의 무작위성 분석",
  },
  ngram: {
    title: "n-gram",
    description: "의심스러운 문자열 조합 빈도 분석",
  },
};

const detectionStatusLabels = {
  suspicious: "의심됨",
  normal: "정상",
  not_analyzed: "분석되지 않음",
};

function Result({ url, result }) {
  const data = result || {
    ...mockResult,
    url: url || mockResult.url,
  };

  const features = data.rag?.extracted_features || {};

  const aiAnalysis = data.rag?.ai_analysis;

  const completedCount =
    data.completed_steps?.length || 0;

  const detectionEntries =
    Object.entries(features);

  useEffect(() => {
    const historyItem = {
      id: Date.now(),
      url: data.url,
      analyzedAt: new Date().toISOString(),
      result: data,
    };

    const savedHistory = localStorage.getItem(
      "phishingAnalysisHistory"
    );

    let history = [];

    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (error) {
        console.error(
          "분석 기록을 불러오지 못했습니다:",
          error
        );
      }
    }

    const alreadyExists = history.some(
      (item) => item.url === historyItem.url
    );

    if (!alreadyExists) {
      const updatedHistory = [
        historyItem,
        ...history,
      ];

      localStorage.setItem(
        "phishingAnalysisHistory",
        JSON.stringify(updatedHistory)
      );
    }
  }, [data.url]);

  return (
    <section className="result-page">
      {/* Header */}
      <div className="result-header">
        <p className="eyebrow">보안 분석 결과</p>

        <h2>분석 결과</h2>

        <p className="result-description">
          입력한 웹사이트의 보안 분석 결과입니다.
        </p>
      </div>

      {/* Target */}
      <div className="result-target">
        <div>
          <p className="result-target-label">
            분석 대상 URL
          </p>

          <p className="result-target-url">
            {data.url}
          </p>
        </div>

        <span className="result-completed">
          {data.status === "partial"
            ? `부분 분석 · ${completedCount}개 완료`
            : "분석 완료"}
        </span>
      </div>

      {/* Blacklist */}
      <div className="risk-card">
        <div className="risk-score">
          <div>
            <span className="score-number">
              {data.blacklist?.matched
                ? "주의"
                : "확인"}
            </span>
          </div>
        </div>

        <div className="risk-info">
          <p className="risk-label">
            {data.blacklist?.matched
              ? "KISA 피싱 사이트 데이터 일치"
              : "KISA 피싱 사이트 데이터 미일치"}
          </p>

          <h3>
            {data.blacklist?.matched
              ? "피싱 사이트 데이터와 일치하는 정보가 확인되었습니다."
              : "KISA 피싱 사이트 데이터에서는 일치 항목이 확인되지 않았습니다."}
          </h3>

          <p>
            {data.blacklist?.match_type
              ? `일치 유형: ${data.blacklist.match_type}`
              : "일치 유형 정보가 없습니다."}
          </p>

          <p>
            출처:{" "}
            {data.blacklist?.source || "-"}
          </p>
        </div>
      </div>

      {/* Detection */}
      <div className="result-section">
        <div className="section-heading">
          <div>
            <p>탐지 결과</p>
          </div>

          <span>
            {detectionEntries.length}개 특징 분석
          </span>
        </div>

        <div className="detection-list">
          {detectionEntries.length > 0 ? (
            detectionEntries.map(
              ([key, status]) => {
                const info = detectionLabels[key];

                return (
                  <div
                    className={`detection-row ${
                      status === "suspicious"
                        ? "suspicious"
                        : status === "normal"
                        ? "normal"
                        : ""
                    }`}
                    key={key}
                  >
                    <div>
                      <h4>
                        {info?.title || key}
                      </h4>

                      <p>
                        {info?.description ||
                          "분석 결과"}
                      </p>
                    </div>

                    <span>
                      {detectionStatusLabels[
                        status
                      ] || status}
                    </span>
                  </div>
                );
              }
            )
          ) : (
            <div className="detection-row">
              <div>
                <h4>분석 데이터 없음</h4>

                <p>
                  분석된 특징 정보가 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Cases */}
      <div className="result-section">
        <div className="section-heading">
          <div>
            <p>유사 피싱 사례</p>
          </div>

          <span>RAG</span>
        </div>

        <div className="assistant-card">
          {data.rag?.similar_cases?.length > 0 ? (
            data.rag.similar_cases.map(
              (item, index) => (
                <div
                  className="finding"
                  key={index}
                >
                  <div className="finding-icon danger">
                    !
                  </div>

                  <div>
                    <h4>
                      유사 사이트
                    </h4>

                    <p>
                      {item.url}
                    </p>

                    <p>
                      유사도:{" "}
                      {Math.round(
                        item.similarity * 100
                      )}
                      %
                    </p>
                  </div>
                </div>
              )
            )
          ) : (
            <p>
              유사 피싱 사례가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="result-section">
        <div className="section-heading">
          <div>
            <p>AI 분석</p>
          </div>

          <span>AI Agent</span>
        </div>

        <div className="ai-analysis-card">
          <div className="ai-badge">
            AI
          </div>

          <div>
            <h3>분석 결과 설명</h3>

            <p className="ai-summary">
              {aiAnalysis?.summary ||
                "AI 분석이 아직 완료되지 않았습니다."}
            </p>

            {aiAnalysis?.reasons?.length > 0 && (
              <div className="ai-reasons">
                {aiAnalysis.reasons.map(
                  (reason, index) => (
                    <div key={index}>
                      <span>✓</span>

                      <p>{reason}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model */}
      <div className="result-section">
        <div className="section-heading">
          <div>
            <p>ML 모델</p>
          </div>

          <span>Machine Learning</span>
        </div>

        <div className="assistant-card">
          <div className="finding">
            <div className="finding-icon normal">
              AI
            </div>

            <div>
              <h4>
                모델 상태
              </h4>

              <p>
                {data.model?.status ||
                  "확인되지 않음"}
              </p>
            </div>
          </div>

          <div className="finding">
            <div className="finding-icon normal">
              ✓
            </div>

            <div>
              <h4>
                위험도 점수
              </h4>

              <p>
                {data.model?.risk_score !== null &&
                data.model?.risk_score !== undefined
                  ? `${data.model.risk_score} / 100`
                  : "아직 산출되지 않았습니다."}
              </p>
            </div>
          </div>

          <div className="finding">
            <div className="finding-icon normal">
              ✓
            </div>

            <div>
              <h4>
                모델 판정
              </h4>

              <p>
                {data.model?.label ||
                  "아직 판정되지 않았습니다."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report */}
      <div className="report-card">
        <div>
          <p className="report-label">
            자동 리포트
          </p>

          <h3>
            AI 분석 리포트 생성
          </h3>

          <p>
            현재 분석 결과를 바탕으로 보안 분석
            리포트를 생성합니다.
          </p>
        </div>

        <button className="report-button">
          리포트 생성
          <span>→</span>
        </button>
      </div>
    </section>
  );
}

export default Result;

