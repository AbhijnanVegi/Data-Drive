from flask import Blueprint, request, jsonify, session

from backend.models.user import User

auth_bp = Blueprint('auth', __name__)

from backend.models.user import User

@auth_bp.route('/register', methods=['POST'])
def register():
    # Get user data from request
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.objects(email=email).first() or User.objects(username=username).first():
        return jsonify({'message': 'User with that email already exists!'}), 400

    user = User(**data).save()
    return jsonify({'message': 'User registered successfully!'})

@auth_bp.route('/login', methods=['POST'])
def login():
    # Get user data from request
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if user exists in database
    user = User.objects(email=email).first()
    if not user:
        return jsonify({'message': 'User does not exist!'}), 400

    # Verify password
    if not user.password == password:
        return jsonify({'message': 'Incorrect password!'}), 400

    # Create session for user
    session['user_id'] = str(user.id)

    return jsonify({'message': 'User logged in successfully!'})

@auth_bp.route('/user', methods=['GET'])
def user():
    return jsonify({'user': session.get('user_id')})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Clear session for user
    session.clear()

    return jsonify({'message': 'User logged out successfully!'})
