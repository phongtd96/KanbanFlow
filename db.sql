CREATE DATABASE kanban_db;
USE kanban_db;
    
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('todo','doing','done') NOT NULL,
    ordering INT NOT NULL,
    priority INT DEFAULT 3,
    tags VARCHAR(255),
    deadline DATE,
    CHECK (status IN ('todo','doing','done')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

INSERT INTO projects (name) VALUES ('Default Project');

INSERT INTO tasks
(title, status, ordering, priority, tags, deadline, project_id)
VALUES
-- TODO (có overdue)
('Phân tích yêu cầu hệ thống', 'todo', 1, 1,
 'analysis,planning,backend',
 DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1),

('Thiết kế kiến trúc hệ thống', 'todo', 2, 2,
 'architecture,design,system',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1),

('Thiết kế giao diện Kanban', 'todo', 3, 2,
 'ui,ux,frontend',
 DATE_ADD(CURDATE(), INTERVAL 5 DAY), 1),

-- DOING (có overdue)
('Thiết kế cơ sở dữ liệu', 'doing', 1, 1,
 'database,sql,backend',
 DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1),

('Xây dựng model SQLAlchemy', 'doing', 2, 1,
 'backend,orm,python',
 DATE_ADD(CURDATE(), INTERVAL 2 DAY), 1),

('Xử lý drag & drop task', 'doing', 3, 2,
 'frontend,javascript,kanban',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1),

-- DONE
('Khởi tạo project Flask', 'done', 1, 3,
 'setup,flask,backend',
 DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1),

('Cấu hình MySQL database', 'done', 2, 3,
 'database,mysql,setup',
 DATE_SUB(CURDATE(), INTERVAL 6 DAY), 1),

('Cài đặt môi trường phát triển', 'done', 3, 3,
 'setup,environment,tools',
 DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1),

('Viết tài liệu báo cáo đồ án', 'done', 4, 2,
 'report,documentation,kanban',
 DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1);
