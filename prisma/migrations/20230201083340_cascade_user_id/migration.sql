-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Snippet` DROP FOREIGN KEY `Snippet_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `Snippet` ADD CONSTRAINT `Snippet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
