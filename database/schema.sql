CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255),
  file_url TEXT,
  content LONGTEXT,
  summary LONGTEXT,
  summary_generated BOOLEAN DEFAULT FALSE,
  learning_path_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
);

CREATE TABLE learning_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  title VARCHAR(255),
  content LONGTEXT,
  estimated_minutes INT DEFAULT 10,
  order_number INT,

  FOREIGN KEY (material_id)
  REFERENCES materials(id)
  ON DELETE CASCADE
);

CREATE TABLE user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  module_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percentage INT DEFAULT 0,
  completed_at TIMESTAMP NULL,

  UNIQUE(user_id,module_id),

  FOREIGN KEY(user_id)
  REFERENCES users(id)
  ON DELETE CASCADE,

  FOREIGN KEY(module_id)
  REFERENCES learning_modules(id)
  ON DELETE CASCADE
);

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(material_id)
  REFERENCES materials(id)
  ON DELETE CASCADE
);

CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer CHAR(1),
  explanation TEXT,

  FOREIGN KEY(quiz_id)
  REFERENCES quizzes(id)
  ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT,
  total_questions INT,
  answers TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id)
  REFERENCES users(id)
  ON DELETE CASCADE,

  FOREIGN KEY(quiz_id)
  REFERENCES quizzes(id)
  ON DELETE CASCADE
);
