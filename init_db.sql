CREATE DATABASE IF NOT EXISTS neo_brustalism_db;
USE neo_brustalism_db;


CREATE TABLE IF NOT EXISTS permission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- Ví dụ: 'create_user', 'delete_post'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- Ví dụ: 'admin', 'editor', 'user'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS role_permission (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,  -- Lưu password đã được băm (bcrypt)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);


-- Thêm permissions
INSERT INTO permission (name, description) VALUES 
('create_user', 'Tạo người dùng mới'),
('delete_user', 'Xóa người dùng'),
('edit_post', 'Chỉnh sửa bài viết');

-- Thêm roles
INSERT INTO role (name, description) VALUES 
('admin', 'Quản trị hệ thống'),
('editor', 'Biên tập viên'),
('member', 'Thành viên thông thường');

-- Gán permission cho role 'admin'
INSERT INTO role_permission (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3);  -- Admin có tất cả quyền

-- Tạo user admin
INSERT INTO user (username, email, password_hash) VALUES 
('admin', 'admin@example.com', '$2a$10$hashedpassword...');  -- Mật khẩu: "123456" (đã băm)

-- Gán role 'admin' cho user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);


-- Lấy tất cả permission của user có id = 1
SELECT p.name 
FROM user u
JOIN user_roles ur ON u.id = ur.user_id
JOIN role_permission rp ON ur.role_id = rp.role_id
JOIN permission p ON rp.permission_id = p.id
WHERE u.id = 1;





SELECT id, username, email, password_hash, is_active, created_at, updated_at
FROM user 
WHERE id = 1 AND is_active = 1




CREATE TABLE IF NOT EXISTS tb_media_file (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    originalName VARCHAR(255) NOT NULL,
    mimetype VARCHAR(155) NOT NULL,
    `size` VARCHAR(50) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    owner VARCHAR(155),
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);










