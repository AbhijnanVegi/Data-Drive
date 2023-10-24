import os, mimetypes

from flask import Blueprint, request, jsonify, session, send_file
from werkzeug.utils import secure_filename

from backend.models.user import User
from backend.models.file import File, SharedFile, Permission

from backend.storage.client import minio_client as mc

files_bp = Blueprint('files', __name__)

@files_bp.route('/<path:path>', methods=['GET'])
def get_file(path):
    """
    Desc: Get file from storage
    Params: path = string
    """
    file = File.objects(path=path).first()
    if not file:
        return jsonify({'message': 'File does not exist!'}), 400

    user = User.objects(id=session.get('user_id')).first()
    if not file.can_read(user):
        return jsonify({'message': 'You do not have permission to access this file!'}), 400

    try:
        mc.fget_object('data-drive', path, '/tmp/' + path)
        return send_file('/tmp/' + path)
    except Exception as err:
        return jsonify({'message': str(err)}), 400


@files_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Desc: Upload file to storage
    Params: path = string
            file = file
    """
    data = request.form

    file = File.objects(path=data.get('path')).first()
    if file:
        return jsonify({'message': 'File already exists!'}), 400

    directory = File.objects(path=os.path.dirname(data.get('path'))).first()
    if not directory:
        return jsonify({'message': 'Directory does not exist!'}), 400
    
    user = User.objects(id=session.get('user_id')).first()
    if not directory.can_write(user):
        return jsonify({'message': 'You do not have permission to upload to this directory!'}), 400

    file = request.files.get('file')
    if not file:
        return jsonify({'message': 'No file provided!'}), 400

    content_type = mimetypes.guess_type(data.get('path'))[0]
    if content_type is None:
        content_type = 'application/octet-stream'

    file.save('/tmp/' + secure_filename(data.get('path')))

    try:
        mc.fput_object('data-drive', data.get('path'), '/tmp/' + secure_filename(data.get('path')), content_type)

        # Create database entry for file
        file = File(path = data.get('path'), size = file.content_length, owner = user, public = directory.public).save()

        # Inherit permissions from parent directory
        shares = SharedFile.objects(file=directory)
        for share in shares:
            SharedFile(file=file, user=share.user, permission=share.permission).save()

        return jsonify({'message': 'File uploaded successfully!'})
        
    except Exception as err:
        print(err)
        return jsonify({'message': str(err)}), 400

@files_bp.route('/mkdir', methods=['POST'])
def mkdir():
    """
    Desc: Create a new directory
    Params: path = string
    """
    data = request.get_json()

    directory = File.objects(path=data.get('path')).first()
    if directory:
        return jsonify({'message': 'Directory already exists!'}), 400

    parent = File.objects(path=os.path.dirname(data.get('path'))).first()
    print(os.path.dirname(data.get('path')))
    if not parent:
        return jsonify({'message': 'Parent directory does not exist!'}), 400

    user = User.objects(id=session.get('user_id')).first()
    if not parent.can_write(user):
        return jsonify({'message': 'You do not have permission to create a directory here!'}), 400

    directory = File(path = data.get('path'), owner = user).save()
    return jsonify({'message': 'Directory created successfully!'})

@files_bp.route('/create_home', methods=['POST'])
def create_home():
    """
    Desc: Create home directory for user
    Note: Use this endpoint only if home directory is not created
    Params: None
    """
    user = User.objects(id=session.get('user_id')).first()
    if not user:
        return jsonify({'message': 'User does not exist!'}), 400

    File(path=user.username, size=0, owner=user).save()
    return jsonify({'message': 'Home directory created successfully!'})
