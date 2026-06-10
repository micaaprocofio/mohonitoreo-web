from datetime import datetime

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import psycopg2
import psycopg2.extras
import bcrypt
import secrets
import string
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


def generar_contrasena(longitud=12):
    """
    Genera una contraseña aleatoria segura.
    """
    caracteres = string.ascii_letters + string.digits + "!@#$%&*"
    return "".join(secrets.choice(caracteres) for _ in range(longitud))


def hashear_contrasena(contrasena):
    """
    Convierte una contraseña normal en hash usando bcrypt.
    """
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(contrasena.encode("utf-8"), salt)
    return hash_bytes.decode("utf-8")


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


@app.route("/")
def menu():
    """
    Pantalla inicial donde el usuario elige Login o Recibir contraseña.
    """
    return render_template("menu.html")


@app.route("/login", methods=["GET", "POST"])
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


@app.route("/recibir-contrasena", methods=["GET", "POST"])
def recibir_contrasena():
    """
    Permite generar una contraseña nueva.
    Si la cédula ya existe, actualiza la contraseña.
    Si la cédula no existe, crea un usuario nuevo con rol 'usuario'.
    """
    error = None
    mensaje = None
    contrasena_generada = None
    cedula_recibida = None
    nombre_recibido = None
    usuario_creado = False

    if request.method == "POST":
        cedula = request.form.get("cedula", "").strip()
        nombre = request.form.get("nombre", "").strip()

        cedula_recibida = cedula
        nombre_recibido = nombre

        if not cedula:
            error = "Debés ingresar una cédula."

        elif not nombre:
            error = "Debés ingresar un nombre."

        else:
            conn = conectar_db()

            try:
                cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

                cur.execute(
                    """
                    SELECT id, cedula, nombre, rol
                    FROM usuarios
                    WHERE cedula = %s
                    """,
                    (cedula,)
                )

                usuario = cur.fetchone()

                contrasena_generada = generar_contrasena()
                contrasena_hash = hashear_contrasena(contrasena_generada)

                if usuario:
                    cur.execute(
                        """
                        UPDATE usuarios
                        SET contrasena_hash = %s
                        WHERE cedula = %s
                        """,
                        (contrasena_hash, cedula)
                    )

                    mensaje = f"Contraseña nueva generada para {usuario['nombre']}."

                else:
                    cur.execute(
                        """
                        INSERT INTO usuarios (cedula, contrasena_hash, nombre, rol)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (cedula, contrasena_hash, nombre, "usuario")
                    )

                    usuario_creado = True
                    mensaje = f"Usuario creado correctamente para {nombre}."

                conn.commit()
                cur.close()

            except Exception as e:
                conn.rollback()
                error = f"Error generando contraseña: {e}"

            finally:
                conn.close()

    return render_template(
        "recibir_contrasena.html",
        error=error,
        mensaje=mensaje,
        contrasena_generada=contrasena_generada,
        cedula_recibida=cedula_recibida,
        nombre_recibido=nombre_recibido,
        usuario_creado=usuario_creado
    )


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
    Devuelve la última lectura del usuario logueado.
    """
    usuario_id = session.get("usuario_id")

    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT id, temperatura, humedad, estado_humedad, timestamp
            FROM lecturas
            WHERE usuario_id = %s
            ORDER BY timestamp DESC
            LIMIT 1
            """,
            (usuario_id,)
        )

        lectura = cur.fetchone()
        cur.close()

    finally:
        conn.close()

    if not lectura:
        return jsonify({
            "hay_datos": False,
            "mensaje": (
                "No hay lecturas para tu usuario. Verificá que lector_serial.py "
                "esté corriendo y que el Arduino esté asociado a tu cédula."
            )
        })

    temperatura = float(lectura["temperatura"])
    humedad = float(lectura["humedad"])
    estado = clasificar_humedad(humedad)
    ts = lectura["timestamp"]
    segundos = (datetime.now() - ts).total_seconds()
    desactualizado = segundos > 60

    return jsonify({
        "hay_datos": True,
        "temperatura": temperatura,
        "humedad": humedad,
        "estado_humedad": estado,
        "mensaje": mensaje_estado(estado),
        "color": color_estado(estado),
        "timestamp": ts.strftime("%d/%m/%Y %H:%M:%S"),
        "desactualizado": desactualizado,
        "mensaje_desactualizado": (
            "La última lectura tiene más de 1 minuto. ¿Está corriendo "
            "python_serial/lector_serial.py con el Arduino conectado?"
            if desactualizado
            else None
        ),
    })


@app.route("/historial")
@login_requerido
def historial():
    """
    Muestra las últimas 100 lecturas del usuario logueado.
    """
    usuario_id = session.get("usuario_id")

    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT temperatura, humedad, estado_humedad, timestamp
            FROM lecturas
            WHERE usuario_id = %s
            ORDER BY timestamp DESC
            LIMIT 100
            """,
            (usuario_id,)
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


@app.route("/admin/usuarios", methods=["GET", "POST"])
@login_requerido
@admin_requerido
def admin_usuarios():
    """
    Panel del administrador para ver y crear usuarios.
    """
    mensaje = None
    error = None
    contrasena_generada = None

    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if request.method == "POST":
            cedula = request.form.get("cedula", "").strip()
            nombre = request.form.get("nombre", "").strip()
            rol = request.form.get("rol", "usuario").strip()

            if not cedula or not nombre:
                error = "La cédula y el nombre son obligatorios."

            elif rol not in ["usuario", "admin"]:
                error = "Rol inválido."

            else:
                contrasena_generada = generar_contrasena()
                contrasena_hash = hashear_contrasena(contrasena_generada)

                try:
                    cur.execute(
                        """
                        INSERT INTO usuarios (cedula, contrasena_hash, nombre, rol)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (cedula, contrasena_hash, nombre, rol)
                    )

                    conn.commit()
                    mensaje = "Usuario creado correctamente."

                except psycopg2.errors.UniqueViolation:
                    conn.rollback()
                    error = "Ya existe un usuario con esa cédula."

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
        usuarios=usuarios,
        mensaje=mensaje,
        error=error,
        contrasena_generada=contrasena_generada
    )


@app.route("/admin/dispositivos")
@login_requerido
@admin_requerido
def admin_dispositivos():
    """
    Panel del administrador para ver qué dispositivos están vinculados a cada usuario.
    """
    conn = conectar_db()

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT 
                d.id,
                d.nombre AS dispositivo,
                d.device_token,
                d.fecha_creacion,
                u.cedula,
                u.nombre AS usuario
            FROM dispositivos d
            JOIN usuarios u ON d.usuario_id = u.id
            ORDER BY d.fecha_creacion DESC
            """
        )

        dispositivos = cur.fetchall()
        cur.close()

    finally:
        conn.close()

    return render_template(
        "admin_dispositivos.html",
        dispositivos=dispositivos
    )


@app.route("/logout")
def logout():
    """
    Cierra la sesión.
    """
    session.clear()
    return redirect(url_for("menu"))


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )