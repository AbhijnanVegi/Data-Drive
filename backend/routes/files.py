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
        file = File(path=data.get('path'), size=file.content_length, owner=user, public=directory.public, is_dir=False).save()

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


@files_bp.route('/share', methods=['POST'])
def share():
    """
    Desc: Shares a given file/dir to another user, updating the user permissions for that file /dir
    Params: 
        path : string = path of dir or file 
        parent_user, child_user, is_file
    """

    data = request.get_json()

    is_file = data.get('is_file')

    parent_user = User.objects(username=data.get('parent_user')).first()
    child_user = User.objects(username=data.get('child_user')).first()
    permission = data.get('permission')

    if not parent_user:
        return jsonify({'message': 'Parent user does not exist!'}), 400
    if not child_user:
        return jsonify({'message': 'Child user does not exist!'}), 400
    if not permission:
        return jsonify({'message': 'Permission not provided!'}), 400

    obj_json = []

    is_file = not File.objects(path=data.get('path')).first().is_dir

    if is_file:
        path = data.get('path')
        file = File.objects(path=path).first()
        if not file:
            return jsonify({'message': 'File does not exist!'}), 400

        shared_file = SharedFile(file=file, user=child_user, permission=permission,
                                 path=f"shared/{child_user.username}/" + path).save()

        if not shared_file:
            return jsonify({'message': 'File does not exist!'}), 400
        else:
            shared_json = {
                'path': shared_file.file.path,
                'user': shared_file.user.username,
                'permission': permission
            }

            return jsonify({'message': 'File shared successfully!', 'shared_file': shared_json})

    else:
        objects = mc.list_objects('data-drive', prefix=data.get('path') + '/', recursive=True, include_user_meta=True)
        obj_json = []
        for obj in objects:
            print(obj.object_name, obj.is_dir, obj.last_modified, obj.etag, obj.size, obj.content_type, obj.metadata)

            if obj.object_name[-1] == '_':
                path = f"shared/{child_user.username}/{obj.object_name[:-2]}"
                file_path = obj.object_name[:-2]
                file = File.objects(path=file_path).first()

            else:
                path = f"shared/{child_user.username}/{obj.object_name}"
                file = File.objects(path=obj.object_name).first()

            print("Shared path is", path)

            if file:
                print("File is", file.path, file.size, file.owner.username, file.is_dir)

                existing_shared_file = SharedFile.objects(file=file, user=child_user).first()

                if existing_shared_file:
                    existing_shared_file.permission = permission
                    existing_shared_file.path = path
                    existing_shared_file.save()
                else:
                    shared_file = SharedFile(file=file, user=child_user, permission=permission,
                                             path=path)

                    if shared_file:
                        shared_file.save()

                        obj_json.append({
                            'path': obj.object_name,
                            'is_dir': obj.is_dir,
                            'last_modified': obj.last_modified,
                            'size': obj.size,
                            'metadata': obj.metadata
                        })

        return jsonify({'objects_folder': obj_json})


@files_bp.route('/list_shared', methods=['GET'])
def get_shared():
    """
    Desc: Get all files shared with user
    Params: None
    """
    data = request.get_json()
    prefix = data.get('path')

    user = User.objects(id=session.get('user_id')).first()
    if not user:
        return jsonify({'message': 'User does not exist!'}), 400

    regex = re.compile(f"{prefix}/[^/]*")
    shared_files = SharedFile.objects(user=user, path=regex)
    shared_json = []
    for shared_file in shared_files:
        shared_json.append({
            'path': shared_file.path,
            'user': shared_file.user.username,
            'permission': shared_file.permission.value
        })

    return jsonify({'shared_files': shared_json})


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
