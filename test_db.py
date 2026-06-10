import psycopg2
from web.config import DB_CONFIG

try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("Conexión exitosa a PostgreSQL")

    cur = conn.cursor()
    cur.execute("SELECT * FROM lecturas;")
    lecturas = cur.fetchall()

    print("Lecturas encontradas:")
    print(lecturas)

    cur.close()
    conn.close()

except Exception as e:
    print("Error conectando a PostgreSQL:")
    print(e)