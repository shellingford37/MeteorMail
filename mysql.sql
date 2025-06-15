CREATE TABLE IF NOT EXISTS `mail` (
                                      `id` bigint NOT NULL AUTO_INCREMENT,
                                      `box` varchar(128) COLLATE utf8mb4_bin NOT NULL,
    `mail_to` varchar(128) COLLATE utf8mb4_bin NOT NULL,
    `mail_from` varchar(128) COLLATE utf8mb4_bin NOT NULL,
    `subject` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    `html` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    `date` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_box_date` (`box`,`date`),
    KEY `idx_date` (`date`)
    ) ENGINE=MyISAM AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;