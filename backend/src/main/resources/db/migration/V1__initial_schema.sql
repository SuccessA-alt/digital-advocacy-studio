CREATE TABLE sdgs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    goal_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY UK1fpbmxlsjviar2rbfy6bh2fbh (goal_number)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE campaigns (
    id BIGINT NOT NULL AUTO_INCREMENT,
    core_message TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    decision_maker VARCHAR(255) NOT NULL,
    desired_outcome TEXT NOT NULL,
    first_moves TEXT NOT NULL,
    problem TEXT NOT NULL,
    sharing_method TEXT NOT NULL,
    success_measures TEXT NOT NULL,
    title VARCHAR(120) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    sdg_id BIGINT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY FKti35t5fkgg3jqg0m1tivi649r (sdg_id),
    CONSTRAINT FKti35t5fkgg3jqg0m1tivi649r
        FOREIGN KEY (sdg_id) REFERENCES sdgs (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE campaign_versions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    advocacy_plan TEXT NOT NULL,
    core_message TEXT NOT NULL,
    decision_maker VARCHAR(255) NOT NULL,
    desired_outcome TEXT NOT NULL,
    problem TEXT NOT NULL,
    saved_at DATETIME(6) NOT NULL,
    sdg_goal_number INT DEFAULT NULL,
    sdg_id BIGINT DEFAULT NULL,
    sdg_name VARCHAR(100) DEFAULT NULL,
    sharing_method TEXT NOT NULL,
    success_measures TEXT NOT NULL,
    title VARCHAR(120) NOT NULL,
    version_number INT NOT NULL,
    campaign_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_campaign_version_number (
        campaign_id,
        version_number
    ),
    CONSTRAINT FKh7wrw3xe5i7t4rbqtm6lqj9mx
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;