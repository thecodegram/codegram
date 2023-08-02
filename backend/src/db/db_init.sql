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
    username VARCHAR(30),
    current_rank INTEGER,
    previous_rank INTEGER,
    score INTEGER
);

CREATE INDEX IF NOT EXISTS idx_users_score ON users (score DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_mongo_id ON users (mongo_id);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    pid INTEGER, 
    user_id INTEGER,
    problem_name VARCHAR(255),
    problem_slug VARCHAR(255),
    event_timestamp TIMESTAMP,
    like_count INTEGER DEFAULT 0,
    CONSTRAINT fk_events_platform FOREIGN KEY (pid) REFERENCES platform(pid) ON DELETE CASCADE,
    CONSTRAINT fk_events_users  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_event_timestamp ON events (event_timestamp DESC);

CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER,
    event_id INTEGER,
    CONSTRAINT fk_likes_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_events FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT pk_likes PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_event_id ON likes (event_id);

CREATE TABLE IF NOT EXISTS notification (
    notification_id SERIAL PRIMARY KEY,
    message VARCHAR(255),
    recipient_id INTEGER,
    type VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notification_user FOREIGN KEY (recipient_id) REFERENCES users(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grind_group (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_member (
    group_id INTEGER,
    user_id INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_group_member PRIMARY KEY (group_id, user_id),
    CONSTRAINT fk_group_member_grind_group FOREIGN KEY (group_id) REFERENCES grind_group(group_id) ON DELETE CASCADE,
    CONSTRAINT fk_group_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_invite (
    group_invite_id SERIAL PRIMARY KEY,
    group_id INTEGER,
    invitee_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_invitee_user FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES grind_group(group_id) ON DELETE CASCADE
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
