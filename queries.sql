CREATE TABLE IF NOT EXISTS Type (
    id INT PRIMARY KEY,
    title VARCHAR (32) UNIQUE,
    description VARCHAR (512)
);

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR (64),
    username VARCHAR (32) UNIQUE,
    password VARCHAR (64),
    typeId INT,
    FOREIGN KEY (typeId) REFERENCES Type (id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS UserDevice (
    userId INT,
    platform INT,
    deviceId VARCHAR (128) UNIQUE,
    FOREIGN KEY (userId) REFERENCES Users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PillBottle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pill VARCHAR(128),
    courseId INT,
    description VARCHAR (1024)
);

CREATE TABLE IF NOT EXISTS PillBottleDosage (
    pillBottleId INT,
    timestamp TIME,
    FOREIGN KEY (pillBottleId) REFERENCES PillBottle (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS UserPill (
    userId INT,
    pillBottleId INT,
    FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (pillBottleId) REFERENCES PillBottle (id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (userId, pillBottleId)
);

INSERT INTO Type (id, title, description) VALUES (1, "Patient", "Patient");
INSERT INTO Type (id, title, description) VALUES (2, "Doctor", "Doctor");

INSERT INTO Users (name, username, password, typeId) VALUES ("Om", "omiyorulz", "sandbox123", 1);
INSERT INTO Users (name, username, password, typeId) VALUES ("Bala", "bala", "blabla", 2);

INSERT INTO PillBottle (id) VALUES (1);
INSERT INTO PillBottleDosage (pillBottleId, timestamp) VALUES (1, "08:00:00");
INSERT INTO PillBottleDosage (pillBottleId, timestamp) VALUES (1, "15:00:00");

INSERT INTO UserPill (userId, pillBottleId) VALUES (1, 1);
INSERT INTO UserPill (userId, pillBottleId) VALUES (2, 1);