import io
import mimetypes
import os
import re

from flask import Blueprint, request, jsonify, session, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

from backend.models.file import File, SharedFile
from backend.models.user import User
from backend.storage.client import minio_client as mc

files_bp = Blueprint('files', __name__)
CORS(files_bp, supports_credentials=True)


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
        file = File(path=data.get('path'), size=file.content_length, owner=user, public=directory.public,
                    is_dir=False).save()

        # Inherit permissions from parent directory
        shares = SharedFile.objects(file=directory)
        for share in shares:
            SharedFile(file=file, user=share.user, permission=share.permission,
                       path=f"shared/{share.user.username}/" + file.path).save()

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

    directory = File(path=data.get('path'), owner=user, is_dir=True).save()
    mc.put_object('data-drive', data.get('path') + '/_', io.BytesIO(b''), 0)
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

    File(path=user.username, size=0, owner=user, is_dir=True).save()
    return jsonify({'message': 'Home directory created successfully!'})


@files_bp.route('/list', methods=['POST'])
def list():
    """
    Desc: List files in directory
    Params: path = string
    Returns: objects = list({path, is_dir, last_modified, size, metadata})
    """
    data = request.get_json()

    directory = File.objects(path=data.get('path')).first()
    if not directory:
        return jsonify({'message': 'Directory does not exist!'}), 400

    user = User.objects(id=session.get('user_id')).first()
    if not directory.can_read(user):
        return jsonify({'message': 'You do not have permission to access this directory!'}), 400

    objects = mc.list_objects('data-drive', prefix=data.get('path') + '/', include_user_meta=True)
    obj_json = []
    for obj in objects:
        print(obj.object_name, obj.is_dir, obj.last_modified, obj.etag, obj.size, obj.content_type, obj.metadata)
        obj_json.append({
            'path': obj.object_name,
            'is_dir': obj.is_dir,
            'last_modified': obj.last_modified,
            'size': obj.size,
            'metadata': obj.metadata
        })

    return jsonify({'objects': obj_json})


@files_bp.route('/get/<path:path>', methods=['GET'])
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

@files_bp.route('/share', methods=['POST'])
def share():
    """
    Desc: Shares a given file/dir to another user, updating the user permissions for that file /dir
    Params: 
        path = string
        child_user = string
        permission = 'read' | 'write' | 'none'
    """

    parent_user = session.get('user_id')
    if not parent_user:
        return jsonify({'message': 'No user logged in!'}), 400

    data = request.get_json()

    child_user = User.objects(username=data.get('child_user')).first()
    permission = data.get('permission')

    if child_user is None:
        return jsonify({'message': 'Child user does not exist!'}), 400
    if permission is None:
        return jsonify({'message': 'Permission not provided!'}), 400

    file = File.objects(path=data.get('path')).first()

    if file is None:
        return jsonify({'message': 'File does not exist!'}), 400
    else:
        parent_user = User.objects(id=parent_user).first()
        if file.owner != parent_user:
            return jsonify({'message': 'You do not have permission to share this file!'}), 400

        shared_file = SharedFile.objects(file=file, user=child_user).first()
        if shared_file is None:
            shared_file = SharedFile(file=file, user=child_user, permission=permission, explicit=True).save()
        else:
            shared_file.permission = permission
            shared_file.save()

    obj_json = []

    objects = mc.list_objects('data-drive', prefix=data.get('path') + '/', recursive=True, include_user_meta=True)
    for obj in objects:
        if obj.object_name[-1] == '_':
            file_path = obj.object_name[:-2]
            file = File.objects(path=file_path).first()
        else:
            file = File.objects(path=obj.object_name).first()

        if file:
            shared_file = SharedFile.objects(file=file, user=child_user).first()
            if shared_file is None:
                shared_file = SharedFile(file=file, user=child_user, permission=permission,
                                                 explicit=False).save()
            else:
                if permission > shared_file.permission:
                    shared_file.permission = permission
                    shared_file.save()

            obj_json.append({
                'path': shared_file.file.path,
                'user': shared_file.user.username,
                'permission': shared_file.permission.value
            })

    return jsonify({'message': 'File shared successfully!', 'shared_files': obj_json})


@files_bp.route('/list_shared', methods=['GET'])
def get_shared():
    """
    Desc: Get all files shared with user
    Params: None
    """

    data = request.get_json()
    path = data.get('path')
    user = session.get('user_id')

    if path is None:
        explicit_shares = SharedFile.objects(explicit=True, user=user)

        shared_json = []
        for explicit_share in explicit_shares:
            shared_json.append({
                'path': explicit_share.file.path,
                'permission': explicit_share.permission.value,
                'is_dir': explicit_share.file.is_dir,
            })

        return jsonify({'shared_files': shared_json})
    else:
        shared_json = []
        file = File.objects(path=path).first()

        if file is None:
            return jsonify({'message': 'File does not exist!'}), 400

        shared_file = SharedFile.objects(file=file, user=user).first()

        if shared_file is None:
            return jsonify({'message': 'No file shared with user!'}), 400
        else:
            if shared_file.file.is_dir:
                objects = mc.list_objects('data-drive', prefix=path + '/', recursive=False, include_user_meta=True)

                obj_json = []
                for obj in objects:
                    obj_json.append({
                        'path': obj.object_name,
                        'is_dir': obj.is_dir,
                        'last_modified': obj.last_modified,
                        'size': obj.size,
                        'metadata': obj.metadata,
                    })

                return jsonify({'shared_objects': obj_json})

@files_bp.route('/clear_shared', methods=['POST'])
def clear_shared():
    """
    Desc: Clear all files shared with user
    Params: None
    """

    user = User.objects(id=session.get('user_id')).first()
    if not user:
        return jsonify({'message': 'User does not exist!'}), 400
    else:
        SharedFile.objects(user=user).delete()
        return jsonify({'message': 'All shared files cleared!'}), 200

@files_bp.route('/download/<path:path>', methods=['GET'])
def download_file(path):
    """
    Desc: Download file from storage
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
        return send_file('/tmp/' + path, as_attachment=True)
    except Exception as err:
        return jsonify({'message': str(err)}), 400

