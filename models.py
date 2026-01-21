from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)

    project_id = db.Column(
        db.Integer,
        db.ForeignKey('projects.id'),
        nullable=False
    )

    title = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum('todo', 'doing', 'done'), nullable=False)
    ordering = db.Column(db.Integer, nullable=False)

    priority = db.Column(db.Integer, default=3)
    tags = db.Column(db.String(255))
    deadline = db.Column(db.Date)
