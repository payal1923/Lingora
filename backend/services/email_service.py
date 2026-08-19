import os
import smtplib

from pathlib import Path

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))

EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

EMAIL_FROM = os.getenv("EMAIL_FROM")

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"


def send_email(to_email: str, subject: str, body: str):

    message = MIMEMultipart()

    message["From"] = EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "html"))

    server = smtplib.SMTP(
        EMAIL_HOST,
        EMAIL_PORT,
    )

    server.starttls()

    server.login(
        EMAIL_USERNAME,
        EMAIL_PASSWORD,
    )

    server.sendmail(
        EMAIL_FROM,
        to_email,
        message.as_string(),
    )

    server.quit()


def send_reset_email(
    to_email: str,
    reset_link: str,
):

    template_path = TEMPLATE_DIR / "reset_password.html"

    with open(template_path, "r", encoding="utf-8") as file:
        html = file.read()

    html = html.replace(
        "{{RESET_LINK}}",
        reset_link,
    )

    send_email(
        to_email=to_email,
        subject="Reset your Lingora password",
        body=html,
    )
