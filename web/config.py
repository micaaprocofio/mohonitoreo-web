import os
from pathlib import Path

from dotenv import load_dotenv

# .env está en la raíz del proyecto (carpeta padre de web/)
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_PATH, override=True)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "dbname": os.getenv("DB_NAME", "sistema_dht"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

print("==================================================")
print(f"Base de datos configurada en config.py: '{DB_CONFIG['dbname']}'")
print("==================================================")

FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "clave_insegura_cambiar")

SERIAL_PORT = os.getenv("SERIAL_PORT", "COM3")
SERIAL_BAUDRATE = int(os.getenv("SERIAL_BAUDRATE", "9600"))