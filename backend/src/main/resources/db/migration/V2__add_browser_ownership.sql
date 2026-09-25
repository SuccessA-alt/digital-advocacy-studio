CREATE TABLE browser_owners (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token_hash VARCHAR(64)
        CHARACTER SET ascii
        COLLATE ascii_bin
        NOT NULL,
    created_at DATETIME(6) NOT NULL,
    last_used_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_browser_owners_token_hash (token_hash)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE campaigns
    ADD COLUMN browser_owner_id BIGINT DEFAULT NULL,
    ADD INDEX idx_campaigns_browser_owner (browser_owner_id),
    ADD CONSTRAINT fk_campaigns_browser_owner
        FOREIGN KEY (browser_owner_id)
        REFERENCES browser_owners (id);