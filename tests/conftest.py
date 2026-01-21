import sys
import os
import pytest

sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
)

from app import app, db
from config import TestConfig


@pytest.fixture
def client():
    app.config.from_object(TestConfig)

    with app.app_context():
        db.create_all()

        yield app.test_client()
        
        db.session.remove()
