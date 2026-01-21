from flask import Flask, render_template, request, jsonify, redirect
from datetime import datetime
from models import db, Project, Task
from config import DevConfig

app = Flask(__name__)
app.config.from_object(DevConfig)

db.init_app(app)

@app.route('/')
def home():
    project = Project.query.first()
    return redirect(f'/project/{project.id}')

@app.route('/project/<int:project_id>')
def project_board(project_id):
    projects = Project.query.all()
    tasks = Task.query.filter_by(project_id=project_id)\
                      .order_by(Task.ordering).all()

    return render_template(
        'index.html',
        projects=projects,
        tasks=tasks,
        current_project=project_id
    )

@app.route('/project/create', methods=['POST'])
def create_project():
    data = request.json
    project = Project(name=data['name'])
    db.session.add(project)
    db.session.commit()
    return jsonify({"id": project.id})

@app.route('/task/create', methods=['POST'])
def create_task():
    data = request.json

    deadline = None
    if data.get('deadline'):
        deadline = datetime.strptime(
            data['deadline'], '%Y-%m-%d'
        ).date()

    task = Task(
        title=data['title'],
        project_id=data['project_id'],
        status='todo',
        ordering=999,
        priority=data.get('priority', 3),
        tags=data.get('tags'),
        deadline=deadline
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"id": task.id})

@app.route('/task/update', methods=['POST'])
def update_task():
    data = request.json
    for item in data:
        task = Task.query.get(item['id'])
        task.status = item['status']
        task.ordering = item['ordering']
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route('/project/<int:project_id>/delete', methods=['POST'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)

    # Xoá toàn bộ task thuộc project
    Task.query.filter_by(project_id=project_id).delete()

    # Xoá project
    db.session.delete(project)
    db.session.commit()

    return jsonify({"success": True})


if __name__ == '__main__':
    app.run(debug=True)

## Update task details
"""
@app.route('/task/<int:task_id>/update', methods=['POST'])
def update_task(task_id):
    data = request.json
    task = Task.query.get_or_404(task_id)

    task.title = data.get('title', task.title)
    task.tags = data.get('tags', task.tags)
    task.priority = data.get('priority', task.priority)

    if data.get('deadline'):
        task.deadline = datetime.strptime(
            data['deadline'], '%Y-%m-%d'
        ).date()
    else:
        task.deadline = None

    db.session.commit()
    return jsonify({"success": True})
"""