# Monitoreo Web - Dashboard de Temperatura y Humedad

Este repositorio contiene la plataforma web construida en **Flask** que visualiza las lecturas de los sensores en tiempo real y permite la administración de usuarios y dispositivos.

## 📁 Estructura
- `web/`: Código fuente de la aplicación Flask (rutas, controladores, lógica de autenticación y templates HTML).
- `database.sql`: Respaldo del esquema de base de datos PostgreSQL.
- `.env.example`: Plantilla de configuración local para crear tu archivo `.env`.
- `requirements.txt`: Dependencias de Python necesarias.
- `test_db.py`: Script de prueba para validar la conexión a la base de datos PostgreSQL.

## 🚀 Cómo correr la Web
1. Abre una terminal en esta carpeta.
2. Crea tu entorno virtual e instala los requerimientos:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
3. Crea un archivo `.env` copiando el `.env.example` y rellena tus credenciales de PostgreSQL.
4. Restaura las tablas ejecutando:
   ```bash
   psql -U postgres -d "sistema dht 2" -f database.sql
   ```
5. Corre la web:
   ```bash
   python web/app.py
   ```
6. Accede en tu navegador a [http://127.0.0.1:5000](http://127.0.0.1:5000).
