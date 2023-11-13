from mongoengine import connect, disconnect


def init_db(config: dict):
    connect(db=config["db"], host=config["host"], port=config["port"], alias="default")


def disconnect_db():
    disconnect(alias="default")
