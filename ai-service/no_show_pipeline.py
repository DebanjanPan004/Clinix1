import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier

ARTIFACTS_DIR = Path(__file__).resolve().parent / 'artifacts'
MODEL_PATH = ARTIFACTS_DIR / 'no_show_xgb_pipeline.joblib'
REPORT_PATH = ARTIFACTS_DIR / 'training_report.json'
FEATURE_IMPORTANCE_PATH = ARTIFACTS_DIR / 'feature_importance.csv'
FEATURE_PLOT_PATH = ARTIFACTS_DIR / 'feature_importance.png'

TARGET_COLUMN = 'No-show'
FEATURE_COLUMNS = [
    'Age',
    'Gender',
    'Scholarship',
    'Hipertension',
    'Diabetes',
    'Alcoholism',
    'SMS_received',
    'days_before_booking',
    'appointment_weekday',
    'Neighbourhood',
]


def ensure_dirs():
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset(csv_path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    return df


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()

    # Parse datetime fields and engineer required date features.
    data['ScheduledDay'] = pd.to_datetime(data['ScheduledDay'], errors='coerce')
    data['AppointmentDay'] = pd.to_datetime(data['AppointmentDay'], errors='coerce')

    data['days_before_booking'] = (
        (data['AppointmentDay'].dt.normalize() - data['ScheduledDay'].dt.normalize())
        .dt.days
        .fillna(0)
        .clip(lower=0)
    )
    data['appointment_weekday'] = data['AppointmentDay'].dt.day_name().fillna('Unknown')

    # Target mapping: Yes = no-show = 1, No = showed = 0.
    data[TARGET_COLUMN] = data[TARGET_COLUMN].map({'Yes': 1, 'No': 0})

    # Drop identifiers and original datetime columns that should not be used directly.
    drop_cols = ['PatientId', 'AppointmentID', 'ScheduledDay', 'AppointmentDay']
    for col in drop_cols:
        if col in data.columns:
            data = data.drop(columns=col)

    # Fill missing values for required features.
    numeric_fill_cols = ['Age', 'Scholarship', 'Hipertension', 'Diabetes', 'Alcoholism', 'SMS_received', 'days_before_booking']
    for col in numeric_fill_cols:
        if col in data.columns:
            data[col] = pd.to_numeric(data[col], errors='coerce')
            data[col] = data[col].fillna(data[col].median() if not data[col].dropna().empty else 0)

    categorical_fill_cols = ['Gender', 'Neighbourhood', 'appointment_weekday']
    for col in categorical_fill_cols:
        if col in data.columns:
            data[col] = data[col].astype(str).replace({'nan': 'Unknown'}).fillna('Unknown')

    # Ensure target has no missing values.
    data = data.dropna(subset=[TARGET_COLUMN])
    data[TARGET_COLUMN] = data[TARGET_COLUMN].astype(int)

    return data


def build_pipeline() -> Pipeline:
    categorical_features = ['Gender', 'Neighbourhood', 'appointment_weekday']
    numeric_features = ['Age', 'Scholarship', 'Hipertension', 'Diabetes', 'Alcoholism', 'SMS_received', 'days_before_booking']

    preprocessor = ColumnTransformer(
        transformers=[
            ('categorical', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('numeric', 'passthrough', numeric_features),
        ]
    )

    model = XGBClassifier(
        n_estimators=220,
        max_depth=5,
        learning_rate=0.06,
        subsample=0.9,
        colsample_bytree=0.9,
        objective='binary:logistic',
        eval_metric='logloss',
        random_state=42,
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', model),
    ])

    return pipeline


def evaluate_model(model: Pipeline, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    y_pred = model.predict(X_test)

    accuracy = float(accuracy_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()
    report_dict = classification_report(y_test, y_pred, output_dict=True)
    report_text = classification_report(y_test, y_pred)

    metrics = {
        'accuracy': accuracy,
        'confusion_matrix': cm,
        'classification_report': report_dict,
        'classification_report_text': report_text,
    }

    return metrics


def save_feature_importance(model: Pipeline):
    try:
        preprocessor: ColumnTransformer = model.named_steps['preprocessor']
        xgb: XGBClassifier = model.named_steps['model']

        feature_names = preprocessor.get_feature_names_out()
        importance = xgb.feature_importances_

        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance,
        }).sort_values('importance', ascending=False)

        importance_df.to_csv(FEATURE_IMPORTANCE_PATH, index=False)

        # Optional plot for quick visual debugging.
        try:
            import matplotlib.pyplot as plt

            top_n = importance_df.head(15)
            plt.figure(figsize=(10, 6))
            plt.barh(top_n['feature'][::-1], top_n['importance'][::-1])
            plt.title('Top Feature Importances - No Show XGBoost')
            plt.xlabel('Importance')
            plt.tight_layout()
            plt.savefig(FEATURE_PLOT_PATH)
            plt.close()
        except Exception:
            # Plot is optional; CSV remains available even if plotting fails.
            pass
    except Exception:
        # Feature importance export is optional and should not break training.
        pass


def train_model(csv_path: str | Path) -> dict:
    ensure_dirs()

    raw_df = load_dataset(csv_path)
    processed_df = preprocess_data(raw_df)

    available_features = [col for col in FEATURE_COLUMNS if col in processed_df.columns]
    X = processed_df[available_features].copy()
    y = processed_df[TARGET_COLUMN].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    metrics = evaluate_model(pipeline, X_test, y_test)

    artifact = {
        'pipeline': pipeline,
        'feature_columns': available_features,
    }
    joblib.dump(artifact, MODEL_PATH)

    save_feature_importance(pipeline)

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)

    return metrics


def _risk_label(probability_0_to_1: float) -> str:
    if probability_0_to_1 < 0.4:
        return 'Low'
    if probability_0_to_1 < 0.7:
        return 'Medium'
    return 'High'


def _prepare_single_input(input_data: dict, feature_columns: list[str]) -> pd.DataFrame:
    payload = dict(input_data)

    # Allow raw datetime inputs and derive engineered columns when present.
    if 'ScheduledDay' in payload and 'AppointmentDay' in payload:
        scheduled = pd.to_datetime(payload.get('ScheduledDay'), errors='coerce')
        appointment = pd.to_datetime(payload.get('AppointmentDay'), errors='coerce')
        if pd.notna(scheduled) and pd.notna(appointment):
            payload['days_before_booking'] = max(0, int((appointment.normalize() - scheduled.normalize()).days))
            payload['appointment_weekday'] = appointment.day_name()

    defaults = {
        'Age': 35,
        'Gender': 'F',
        'Scholarship': 0,
        'Hipertension': 0,
        'Diabetes': 0,
        'Alcoholism': 0,
        'SMS_received': 0,
        'days_before_booking': 7,
        'appointment_weekday': 'Monday',
        'Neighbourhood': 'Unknown',
    }

    row = {feature: payload.get(feature, defaults.get(feature)) for feature in feature_columns}
    return pd.DataFrame([row])


def load_model_artifact(model_path: str | Path = MODEL_PATH) -> dict:
    artifact = joblib.load(model_path)
    return artifact


def predict_no_show_risk(input_data: dict, model_path: str | Path = MODEL_PATH) -> dict:
    artifact = load_model_artifact(model_path)
    pipeline: Pipeline = artifact['pipeline']
    feature_columns: list[str] = artifact['feature_columns']

    input_df = _prepare_single_input(input_data, feature_columns)
    probability = float(pipeline.predict_proba(input_df)[0][1])

    return {
        'risk_score': round(probability, 4),
        'risk_label': _risk_label(probability),
    }


def main():
    project_root_csv = Path(__file__).resolve().parent.parent / 'Medical_Appointment_No_Shows.csv'
    metrics = train_model(project_root_csv)

    print('Model training completed.')
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print('Confusion Matrix:')
    print(metrics['confusion_matrix'])
    print('Classification Report:')
    print(metrics['classification_report_text'])

    sample_input = {
        'Age': 42,
        'Gender': 'F',
        'Scholarship': 0,
        'Hipertension': 1,
        'Diabetes': 0,
        'Alcoholism': 0,
        'SMS_received': 1,
        'days_before_booking': 4,
        'appointment_weekday': 'Wednesday',
        'Neighbourhood': 'Unknown',
    }
    prediction = predict_no_show_risk(sample_input)
    print('Sample Prediction:')
    print(prediction)


if __name__ == '__main__':
    main()
