ALTER TABLE activity_logs 
ADD COLUMN action_group VARCHAR(50) DEFAULT 'SYSTEM' AFTER action_type,
ADD COLUMN ip_address VARCHAR(45) AFTER description;

-- Update existing logs to a default group if needed
UPDATE activity_logs SET action_group = 'SYSTEM' WHERE action_group IS NULL;
