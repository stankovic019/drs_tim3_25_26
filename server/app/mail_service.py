import os
import smtplib
from email.message import EmailMessage


def send_email(to_email: str, subject: str, body: str) -> None:
    host = os.getenv("SMTP_HOST", "localhost")
    port = int(os.getenv("SMTP_PORT", "1025"))
    from_email = os.getenv("SMTP_FROM", "no-reply@quiz.local")

    use_tls = os.getenv("SMTP_USE_TLS", "false").lower() in ("1", "true", "yes")
    username = os.getenv("SMTP_USERNAME") or None
    password = os.getenv("SMTP_PASSWORD") or None

    msg = EmailMessage()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(host, port) as s:
        if use_tls:
            s.starttls()
        if username and password:
            s.login(username, password)
        s.send_message(msg)


def send_role_changed_email(to_email: str, new_role: str) -> None:
    subject = "Role Changed Notification"
    body = (
        "Hello,\n\n"
        f"We just wanted to inform you that your role on the system has been changed. New role: {new_role}\n\n"
        "Best regards."
    )
    send_email(to_email, subject, body)
