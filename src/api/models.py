
from flask_sqlalchemy import SQLAlchemy
import hashlib
import os
import binascii

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False) 
    is_active = db.Column(db.Boolean(), default=True, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, plain_password):
        """
        Hashea la contraseña usando hashlib con PBKDF2 y la almacena junto con el salt.
        """
        salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')  
        pwdhash = hashlib.pbkdf2_hmac('sha512', plain_password.encode('utf-8'),
                                      salt, 100000)  
        pwdhash = binascii.hexlify(pwdhash)
        
        self.password = (salt + pwdhash).decode('ascii')  

    def check_password(self, plain_password):
        """
        Verifica una contraseña en texto plano contra el hash almacenado.
        """
        salt = self.password[:64]
        stored_pwdhash = self.password[64:]
        pwdhash = hashlib.pbkdf2_hmac('sha512',
                                      plain_password.encode('utf-8'),
                                      salt.encode('ascii'),
                                      100000)
        pwdhash = binascii.hexlify(pwdhash).decode('ascii')
        return pwdhash == stored_pwdhash

    def serialize(self):
        """
        Serializa el objeto User para JSON.
        """
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active
            # No se incluye la contraseña por razones de seguridad
        }
