import os
import sys
import subprocess
import platform

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if platform.system() == "Windows":
    python_path = os.path.join(BASE_DIR, "env", "Scripts", "python.exe")
else:
    python_path = os.path.join(BASE_DIR, "env", "bin", "python")

if not os.path.exists(python_path):
    print("❌ Virtual environment nije pronađen.")
    print("➡️ Proveri da li postoji 'env' folder.")
    sys.exit(1)

print("✅ Pokrećem backend koristeći virtual environment...")
subprocess.run([python_path, "-m", "app.main"])
