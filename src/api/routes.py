"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os

api = Blueprint('api', __name__)

CORS(api, resources={r"/*": {"origins": os.getenv("FRONT_URL"), "allow_headers": ["Authorization", "Content-Type"], "supports_credentials": True}})

@api.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] =  os.getenv("FRONT_URL")
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response




# -------------------- Endpoint de Registro --------------------
@api.route('/signup', methods=['POST'])
def signup():
    """
    Endpoint para registrar un nuevo usuario.
    Espera un JSON con 'email' y 'password'.
    """
    try:
        request_body = request.get_json()
        if not request_body:
            return jsonify({"message": "Solicitud JSON inválida"}), 400

        required_fields = ['email', 'password']
        missing_fields = [field for field in required_fields if field not in request_body]
        if missing_fields:
            return jsonify({"message": f"Faltan los campos: {', '.join(missing_fields)}"}), 400

        email = request_body['email']
        password = request_body['password']

        
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "El usuario ya existe"}), 409

       
        new_user = User(email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Usuario creado exitosamente"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error interno del servidor: {str(e)}"}), 500

# -------------------- Endpoint de Inicio de Sesión --------------------
@api.route('/login', methods=['POST'])
def login():
    """
    Endpoint para iniciar sesión.
    Espera un JSON con 'email' y 'password'.
    Devuelve un token JWT si la autenticación es exitosa.
    """
    try:
        request_body = request.get_json()
        if not request_body:
            return jsonify({"message": "Solicitud JSON inválida"}), 400

        required_fields = ['email', 'password']
        missing_fields = [field for field in required_fields if field not in request_body]
        if missing_fields:
            return jsonify({"message": f"Faltan los campos: {', '.join(missing_fields)}"}), 400

        email = request_body['email']
        password = request_body['password']

       
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "Correo electrónico o contraseña incorrectos"}), 401

        
        if not user.check_password(password):
            return jsonify({"message": "Correo electrónico o contraseña incorrectos"}), 401

        # Crear token de acceso
        access_token = create_access_token(identity=str(user.id))

        return jsonify({"access_token": access_token}), 200

    except Exception as e:
        return jsonify({"message": f"Error interno del servidor: {str(e)}"}), 500



@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    """
    Ruta protegida que solo puede ser accedida por usuarios autenticados.
    Retorna información básica del usuario.
    """
    try:
        
        auth_header = request.headers.get('Authorization')
        print(f"Authorization Header: {auth_header}") 

       
        current_user_id = get_jwt_identity()
        print(f"Decoded User ID: {current_user_id}") 

        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404

        return jsonify({
            "message": f"Bienvenido, {user.email}!",
            "user": user.serialize()  
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error interno del servidor: {str(e)}"}), 500
