DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS message_states;
DROP TABLE IF EXISTS devices;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role_id INT,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    api_key VARCHAR(255),
);

-- Create the roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    device_id INT,
    state VARCHAR(255) NOT NULL,
    metadata JSON,
    remote_message_id VARCHAR(255),
    remote_jid VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the message_states table
CREATE TABLE message_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT,
    state VARCHAR(255) NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the devices table
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(255),
    user_id INT,
    token VARCHAR(255),
    webhook_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Insert dummy data into the roles table
INSERT INTO roles (slug, name, created_at, updated_at)
VALUES
    ('user', 'User', NOW(), NOW()),
    ('admin', 'Administrator', NOW(), NOW());

-- Insert dummy data into the users table 

INSERT INTO users (email, role_id, password, is_active, created_at, updated_at)
VALUES
    ('aditya5660@gmail.com', 1, '$2a$12$pg7/TwWoq9L9t.g1ySYdc.u3.NMIhFKuzqn8SQvQ1XWXKe5LT6e3q', 1, NOW(), NOW()), 
    ('admin@codeinaja.net', 2, '$2a$12$pg7/TwWoq9L9t.g1ySYdc.u3.NMIhFKuzqn8SQvQ1XWXKe5LT6e3q', 1, NOW(), NOW());  
