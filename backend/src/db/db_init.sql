CREATE TABLE IF NOT EXISTS platform (
    pid SERIAL PRIMARY KEY,
    pname VARCHAR(20) UNIQUE
);

INSERT INTO platform (pid, pname) 
    VALUES 
     (1,'leetcode'),
     (2,'vjudge')
    ON CONFLICT (pid)
    DO UPDATE SET pid = EXCLUDED.pid, pname = EXCLUDED.pname;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    mongo_id VARCHAR(25) NOT NULL,
    username VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    pid INTEGER, 
    user_id INTEGER,
    problem_name VARCHAR(255),
    problem_slug VARCHAR(255),
    event_timestamp TIMESTAMP,
    CONSTRAINT fk_events_platform FOREIGN KEY (pid) REFERENCES platform(pid) ON DELETE CASCADE,
    CONSTRAINT fk_events_users  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATe TABLE IF NOT EXISTS likes (
    user_id INTEGER,
    event_id INTEGER,
    CONSTRAINT fk_likes_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_events FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT pk_likes PRIMARY KEY (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS grind_group (
    gid SERIAL PRIMARY KEY,
    group_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_group (
    group_id INTEGER,
    user_id INTEGER,
    member_since TIMESTAMP,
    CONSTRAINT pk_user_group PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_user_group_grind_group FOREIGN KEY (group_id) REFERENCES grind_group(gid) ON DELETE CASCADE,
    CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS follower (
    follower_id INTEGER,
    followee_id INTEGER,
    CONSTRAINT fk_follower_users  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_folowee_users FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT pk_follower PRIMARY KEY (follower_id, followee_id)
);

CREATE TABLE IF NOT EXISTS notification (
    notification_id SERIAL PRIMARY KEY,
    message VARCHAR(255),
    recipient_id INTEGER,
    type VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notification_user FOREIGN KEY (recipient_id) REFERENCES users(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friend_request (
    friend_request_id SERIAL PRIMARY KEY,
    requester_id INTEGER,
    requestee_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_requester_user FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_requestee_user FOREIGN KEY (requestee_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS friend (
    user_1_id INTEGER,
    user_2_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
    CONSTRAINT fk_user_1  FOREIGN KEY (user_1_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_2 FOREIGN KEY (user_2_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT pk_friend PRIMARY KEY (user_1_id, user_2_id)
);
