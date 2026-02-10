import io
import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from threading import Thread
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def run_async(function, *args, **kwargs) -> Thread:
    worker = Thread(target=function, args=args, kwargs=kwargs, daemon=True)
    worker.start()
    return worker


def send_email(to_email: str, subject: str, body: str) -> None:
    host = os.getenv("SMTP_HOST", "localhost")
    port = int(os.getenv("SMTP_PORT", "1025"))
    from_email = os.getenv("SMTP_FROM", "no-reply@quiz.local")
    timeout = int(os.getenv("SMTP_TIMEOUT", "15"))

    use_tls = parse_bool(os.getenv("SMTP_USE_TLS", "false"))
    username = os.getenv("SMTP_USERNAME") or None
    password = os.getenv("SMTP_PASSWORD") or None

    msg = EmailMessage()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(host, port, timeout=timeout) as smtp:
        smtp.ehlo()
        if use_tls:
            smtp.starttls()
            smtp.ehlo()
        if username and password:
            smtp.login(username, password)
        smtp.send_message(msg)


def send_email_with_attachments(
    to_email: str,
    subject: str,
    body: str,
    attachments: list[dict[str, Any]] | None = None,
) -> None:
    host = os.getenv("SMTP_HOST", "localhost")
    port = int(os.getenv("SMTP_PORT", "1025"))
    from_email = os.getenv("SMTP_FROM", "no-reply@quiz.local")
    timeout = int(os.getenv("SMTP_TIMEOUT", "15"))

    use_tls = parse_bool(os.getenv("SMTP_USE_TLS", "false"))
    username = os.getenv("SMTP_USERNAME") or None
    password = os.getenv("SMTP_PASSWORD") or None

    msg = EmailMessage()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    for item in attachments or []:
        filename = item.get("filename", "attachment.bin")
        data = item.get("data", b"")
        if isinstance(data, str):
            data = data.encode("utf-8")

        file_type = item.get("file_type", "application/octet-stream")
        if "/" in file_type:
            maintype, subtype = file_type.split("/", 1)
        else:
            maintype, subtype = "application", "octet-stream"

        msg.add_attachment(
            data,
            maintype=maintype,
            subtype=subtype,
            filename=filename,
        )

    with smtplib.SMTP(host, port, timeout=timeout) as smtp:
        smtp.ehlo()
        if use_tls:
            smtp.starttls()
            smtp.ehlo()
        if username and password:
            smtp.login(username, password)
        smtp.send_message(msg)


def send_email_async(to_email: str, subject: str, body: str) -> Thread:
    return run_async(send_email, to_email, subject, body)


def send_email_with_attachments_async(
    to_email: str,
    subject: str,
    body: str,
    attachments: list[dict[str, Any]] | None = None,
) -> Thread:
    return run_async(send_email_with_attachments, to_email, subject, body, attachments)


def send_role_changed_email(to_email: str, new_role: str) -> None:
    subject = "Role Changed Notification"
    body = (
        "Hello,\n\n"
        f"We just wanted to inform you that your role on the system has been changed. New role: {new_role}\n\n"
        "Best regards."
    )
    send_email(to_email, subject, body)


def send_role_changed_email_async(to_email: str, new_role: str) -> Thread:
    subject = "Role Changed Notification"
    body = (
        "Hello,\n\n"
        f"We just wanted to inform you that your role on the system has been changed. New role: {new_role}\n\n"
        "Best regards."
    )
    return send_email_async(to_email, subject, body)


def draw_separator_line(pdf: canvas.Canvas, y: int) -> None:
    pdf.line(40, y, 555, y)


def format_datetime(value: Any) -> str:
    if value is None:
        return "N/A"
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")
    return str(value)


def build_quiz_report_pdf_bytes(
    quiz_id: int,
    quiz_title: str,
    attempt_rows: list[dict[str, Any]],
) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(40, y, f"Quiz report #{quiz_id}")
    y -= 22

    pdf.setFont("Helvetica", 11)
    pdf.drawString(40, y, f"Title: {quiz_title}")
    y -= 16
    pdf.drawString(40, y, f"Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} ")
    y -= 16
    pdf.drawString(40, y, f"Total attempts: {len(attempt_rows)}")
    y -= 16
    draw_separator_line(pdf, y)
    y -= 20

    def score_key(row: dict[str, Any]) -> int:
        score = row.get("score")
        return score if isinstance(score, int) else -1

    sorted_rows = sorted(attempt_rows, key=score_key, reverse=True)

    pdf.setFont("Helvetica", 10)
    for index, row in enumerate(sorted_rows, start=1):
        name = row.get("name") or f"Player {row.get('player_id', 'N/A')}"
        score = row.get("score")
        finished_at = format_datetime(row.get("finished_at"))
        duration_seconds = row.get("duration_seconds")

        score_text = str(score) if score is not None else "N/A"
        duration_text = str(duration_seconds) if duration_seconds is not None else "N/A"

        line = (
            f"{index}. {name} | player_id={row.get('player_id')} | "
            f"score={score_text} | duration={duration_text}s | finished={finished_at}"
        )

        if y < 50:
            pdf.showPage()
            y = height - 50
            pdf.setFont("Helvetica", 10)

        pdf.drawString(40, y, line[:120])  
        y -= 16

    pdf.save()
    buffer.seek(0)
    return buffer.getvalue()


def send_quiz_report_email_async(
    to_email: str,
    quiz_id: int,
    quiz_title: str,
    attempt_rows: list[dict[str, Any]],
) -> Thread:
    pdf_bytes = build_quiz_report_pdf_bytes(quiz_id, quiz_title, attempt_rows)

    subject = f"Quiz report #{quiz_id} - {quiz_title}"
    body = (
        "Hello,\n\n"
        f"In attachment you can find the PDF report for quiz '{quiz_title}' (ID: {quiz_id}).\n\n"
        "Best regards."
    )

    attachments = [
        {
            "filename": f"quiz_report_{quiz_id}.pdf",
            "data": pdf_bytes,
            "file_type": "application/pdf",
        }
    ]

    return send_email_with_attachments_async(to_email, subject, body, attachments)
