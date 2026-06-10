from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import psycopg2
import psycopg2.extras
import bcrypt
from functools import wraps
from config import DB_CONFIG, FLASK_SECRET_KEY


app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY


def conectar_db():
    """
    Conecta Flask con PostgreSQL.
    """
    return psycopg2.connect(**DB_CONFIG)


def clasificar_humedad(humedad):
    """
    Clasifica la humedad según el porcentaje.
    """
    if humedad >= 70:
        return "ALTA"
    elif 40 <= humedad <= 69:
        return "NORMAL"
    else:
        return "BAJA"


def mensaje_estado(estado):
    """
    Devuelve un mensaje descriptivo según el estado.
    """
    if estado == "ALTA":
        return "⚠️ Humedad alta: se recomienda ventilación."
    elif estado == "NORMAL":
        return "✅ Humedad normal: ambiente estable."
    elif estado == "BAJA":
        return "⚠️ Humedad baja: se recomienda revisar el ambiente."
    return "Estado desconocido."


def color_estado(estado):
    """
    Devuelve el color Bootstrap según el estado.
    """
    if estado == "ALTA":
        return "danger"
    elif estado == "NORMAL":
        return "success"
    elif estado == "BAJA":
        return "warning"
    return "secondary"


def login_requerido(f):
    """
    Protege rutas para que solo entren usuarios logueados.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "usuario_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return wrapper


def admin_requerido(f):
    """
    Protege rutas que solo puede ver el administrador.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "usuario_id" not in session:
            return redirect(url_for("login"))

        if session.get("usuario_rol") != "admin":
            return redirect(url_for("dashboard"))

        return f(*args, **kwargs)

    return wrapper


@app.route("/", methods=["GET", "POST"])
def login():
    """
    Pantalla de login.
    """
    if request.method == "POST":
        cedula = request.form.get("cedula", "").strip()
        contrasena = request.form.get("contrasena", "")

        conn = conectar_db()

        try:
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

            cur.execute(
                """
                SELECT id, cedula, nombre, contrasena_hash, rol
                FROM usuarios
                WHERE cedula = %s
                """,
                (cedula,)
            )

            usuario = cur.fetchone()
            cur.close()

        finally:
            conn.close()

        if usuario:
            hash_guardado = usuario["contrasena_hash"].encode("utf-8")

            if bcrypt.checkpw(contrasena.encode("utf-8"), hash_guardado):
                session["usuario_id"] = usuario["id"]
                session["usuario_nombre"] = usuario["nombre"]
                session["usuario_cedula"] = usuario["cedula"]
                session["usuario_rol"] = usuario["rol"]

                return redirect(url_for("dashboard"))

        return render_template(
            "login.html",
            error="Cédula o contraseña incorrecta."
        )

    return render_template("login.html")


@app.route("/dashboard")
@login_requerido
def dashboard():
    """
    Panel principal.
    """
    return render_template(
        "dashboard.html",
        nombre=session.get("usuario_nombre")
    )


@app.route("/api/ultima_lectura")
@login_requerido
def api_ultima_lectura():
    """
    Devuelve la última lectura en formato JSON.
    El navegador consulta esta ruta cada 5 segundos.
    """
    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT id, temperatura, humedad, estado_humedad, timestamp
            FROM lecturas
            ORDER BY timestamp DESC
            LIMIT 1
            """
        )

        lectura = cur.fetchone()
        cur.close()

    finally:
        conn.close()

    if not lectura:
        return jsonify({
            "hay_datos": False,
            "mensaje": "Todavía no hay lecturas registradas."
        })

    temperatura = float(lectura["temperatura"])
    humedad = float(lectura["humedad"])
    estado = clasificar_humedad(humedad)

    return jsonify({
        "hay_datos": True,
        "temperatura": temperatura,
        "humedad": humedad,
        "estado_humedad": estado,
        "mensaje": mensaje_estado(estado),
        "color": color_estado(estado),
        "timestamp": lectura["timestamp"].strftime("%d/%m/%Y %H:%M:%S")
    })


@app.route("/historial")
@login_requerido
def historial():
    """
    Muestra las últimas 100 lecturas.
    """
    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT temperatura, humedad, estado_humedad, timestamp
            FROM lecturas
            ORDER BY timestamp DESC
            LIMIT 100
            """
        )

        lecturas = cur.fetchall()
        cur.close()

    finally:
        conn.close()

    return render_template(
        "historial.html",
        lecturas=lecturas,
        color_estado=color_estado
    )


@app.route("/admin/usuarios")
@login_requerido
@admin_requerido
def admin_usuarios():
    """
    Panel del administrador para ver todos los usuarios registrados.
    """
    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT id, cedula, nombre, rol, fecha_creacion
            FROM usuarios
            ORDER BY fecha_creacion DESC
            """
        )

        usuarios = cur.fetchall()
        cur.close()

    finally:
        conn.close()

    return render_template(
        "admin_usuarios.html",
        usuarios=usuarios
    )


@app.route("/logout")
def logout():
    """
    Cierra la sesión.
    """
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )