# config.py

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "dev-secret-key"


class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = (
        "mysql+pymysql://root:@localhost/kanban_db"
    )
    DEBUG = True


class TestConfig(Config):
    # DB test hoàn toàn tách biệt
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    TESTING = True
