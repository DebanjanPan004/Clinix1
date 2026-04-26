from pathlib import Path

from flask import Flask, jsonify, request

from no_show_pipeline import MODEL_PATH, predict_no_show_risk, train_model

app = Flask(__name__)


def ensure_trained_model():
    if MODEL_PATH.exists():
        return

    csv_path = Path(__file__).resolve().parent.parent / 'Medical_Appointment_No_Shows.csv'
    train_model(csv_path)


def to_pipeline_payload(payload: dict) -> dict:
    # Accept both strict dataset-style input and legacy dashboard compact input.
    mapped = dict(payload)

    if 'patientNoShowRate' in payload:
        mapped.setdefault('days_before_booking', max(0, int(payload.get('daysSinceLastVisit', 7) / 4)))
        mapped.setdefault('appointment_weekday', 'Monday')
        mapped.setdefault('Age', 35)
        mapped.setdefault('Gender', 'F')
        mapped.setdefault('Scholarship', 0)
        mapped.setdefault('Hipertension', 0)
        mapped.setdefault('Diabetes', 0)
        mapped.setdefault('Alcoholism', 0)
        mapped.setdefault('SMS_received', 1)
        mapped.setdefault('Neighbourhood', 'Unknown')

    return mapped


def label_to_probability_band(label: str) -> float:
    if label == 'High':
        return 0.85
    if label == 'Medium':
        return 0.55
    return 0.2


@app.get('/health')
def health():
    ensure_trained_model()
    return jsonify({'ok': True, 'model': 'xgboost', 'artifact': str(MODEL_PATH)})


@app.post('/predict/no-show')
def predict_no_show():
    ensure_trained_model()

    payload = request.get_json(silent=True) or {}
    model_input = to_pipeline_payload(payload)

    prediction = predict_no_show_risk(model_input)
    probability_percent = round(float(prediction['risk_score']) * 100, 1)

    # Keep legacy response fields expected by backend while exposing strict pipeline output too.
    return jsonify({
        'probability_percent': probability_percent,
        'label': prediction['risk_label'],
        'model': 'xgboost',
        'risk_score': prediction['risk_score'],
        'risk_label': prediction['risk_label'],
        'band': label_to_probability_band(prediction['risk_label']),
    })


if __name__ == '__main__':
    ensure_trained_model()
    app.run(host='0.0.0.0', port=8001)
