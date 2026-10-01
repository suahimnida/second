"""ML 피싱 판별 모델.

TODO(4단계): 학습된 모델을 로드하고 codes/preprocess.py의 extract_features()로 예측하도록 교체.
"""

from app.schemas import ModelResult


def predict(url: str) -> ModelResult:
    return ModelResult(status="not_connected")
