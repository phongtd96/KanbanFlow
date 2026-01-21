from models import Project, Task


def test_create_project(client):
    res = client.post('/project/create', json={"name": "Project A"})
    assert res.status_code == 200
    assert Project.query.count() == 1


def test_create_multiple_projects(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/project/create', json={"name": "Project B"})
    assert Project.query.count() == 2


def test_create_task(client):
    client.post('/project/create', json={"name": "Project A"})

    res = client.post('/task/create', json={
        "title": "Task 1",
        "project_id": 1
    })
    assert res.status_code == 200
    assert Task.query.count() == 1


def test_create_task_with_deadline(client):
    client.post('/project/create', json={"name": "Project A"})

    client.post('/task/create', json={
        "title": "Task deadline",
        "project_id": 1,
        "deadline": "2026-01-10"
    })

    task = Task.query.first()
    assert task.deadline is not None


def test_update_task_status(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/task/create', json={
        "title": "Task 1",
        "project_id": 1
    })

    res = client.post('/task/update', json=[
        {"id": 1, "status": "done", "ordering": 0}
    ])
    assert res.status_code == 200

    task = Task.query.first()
    assert task.status == "done"


def test_task_done_not_overdue(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/task/create', json={
        "title": "Old task",
        "project_id": 1,
        "deadline": "2020-01-01"
    })

    client.post('/task/update', json=[
        {"id": 1, "status": "done", "ordering": 0}
    ])

    task = Task.query.first()
    assert task.status == "done"


def test_delete_project_cascade_task(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/task/create', json={
        "title": "Task 1",
        "project_id": 1
    })

    res = client.post('/project/1/delete')
    assert res.status_code == 200
    assert Task.query.count() == 0
    assert Project.query.count() == 0


def test_task_tag_saved(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/task/create', json={
        "title": "Task Tag",
        "project_id": 1,
        "tags": "frontend,ui"
    })

    task = Task.query.first()
    assert "frontend" in task.tags


def test_default_priority(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/task/create', json={
        "title": "Task priority",
        "project_id": 1
    })

    task = Task.query.first()
    assert task.priority in (2, 3)


def test_update_task_ordering(client):
    client.post('/project/create', json={"name": "Project A"})
    client.post('/task/create', json={
        "title": "Task 1",
        "project_id": 1
    })

    client.post('/task/update', json=[
        {"id": 1, "status": "todo", "ordering": 5}
    ])

    task = Task.query.first()
    assert task.ordering == 5
