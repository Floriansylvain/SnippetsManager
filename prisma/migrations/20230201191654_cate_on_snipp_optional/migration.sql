-- DropForeignKey
ALTER TABLE `Snippet` DROP FOREIGN KEY `Snippet_category_id_fkey`;

-- AlterTable
ALTER TABLE `Snippet` MODIFY `category_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Snippet` ADD CONSTRAINT `Snippet_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
