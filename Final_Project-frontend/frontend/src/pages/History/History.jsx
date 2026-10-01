import { useEffect, useState } from "react";
import "./History.css";

function History({ onViewResult }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(
      "phishingAnalysisHistory"
    );

    if (!savedHistory) {
      return;
    }

    try {
      const parsedHistory = JSON.parse(savedHistory);

      if (Array.isArray(parsedHistory)) {
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error(
        "분석 기록을 불러오지 못했습니다:",
        error
      );
    }
  }, []);

  const handleDelete = (id) => {
    const updatedHistory = history.filter(
      (item) => item.id !== id
    );

    setHistory(updatedHistory);

    localStorage.setItem(
      "phishingAnalysisHistory",
      JSON.stringify(updatedHistory)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString(
      "ko-KR",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getRiskStatus = (result) => {
    if (result?.risk_level === "high") {
      return {
        label: "피싱 의심",
        className: "danger",
      };
    }

    if (result?.risk_level === "medium") {
      return {
        label: "주의 필요",
        className: "warning",
      };
    }

    return {
      label: "정상",
      className: "normal",
    };
  };

  return (
    <section className="history-page">
      {/* Header */}
      <div className="history-header">
        <div>
          <p className="history-eyebrow">
            ANALYSIS HISTORY
          </p>

          <h2>분석 기록</h2>

          <p className="history-description">
            이전에 분석한 웹사이트의 결과를 확인할 수 있습니다.
          </p>
        </div>

        <div className="history-count">
          <span>{history.length}</span>
          <small>건</small>
        </div>
      </div>

      {/* Empty */}
      {history.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">
            ◷
          </div>

          <h3>분석 기록이 없습니다.</h3>

          <p>
            웹사이트를 분석하면
            <br />
            이곳에 분석 기록이 저장됩니다.
          </p>
        </div>
      ) : (
        /* History List */
        <div className="history-list">
          {history.map((item) => {
            const riskStatus = getRiskStatus(
              item.result
            );

            return (
              <article
                className="history-card"
                key={item.id}
              >
                <div className="history-card-main">
                  {/* Status / Date */}
                  <div className="history-card-top">
                    <span
                      className={`history-status ${riskStatus.className}`}
                    >
                      {riskStatus.label}
                    </span>

                    <span className="history-date">
                      {formatDate(item.analyzedAt)}
                    </span>
                  </div>

                  {/* URL */}
                  <h3>{item.url}</h3>

                  {/* Summary */}
                  <p>
                    {item.result?.ai_analysis?.summary ||
                      "분석 결과를 확인할 수 있습니다."}
                  </p>
                </div>

                {/* Actions */}
                <div className="history-card-actions">
                  <button
                    className="history-view-button"
                    onClick={() =>
                      onViewResult(item)
                    }
                  >
                    결과 보기
                    <span>→</span>
                  </button>

                  <button
                    className="history-delete-button"
                    onClick={() =>
                      handleDelete(item.id)
                    }
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default History;

