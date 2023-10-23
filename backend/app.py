from flask import Flask

from backend.config import MONGO_CONFIG 
from backend.models.orm import db

from backend.routes.auth import auth_bp

app = Flask("data-drive")
app.config["MONGODB_SETTINGS"] = [MONGO_CONFIG]
app.secret_key = b'_x75gjTO!kdP'
db.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True)

