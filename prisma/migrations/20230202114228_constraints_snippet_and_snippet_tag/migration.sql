-- DropForeignKey
ALTER TABLE `Snippet` DROP FOREIGN KEY `Snippet_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `Snippet_tag` DROP FOREIGN KEY `Snippet_tag_snippet_id_fkey`;

-- DropForeignKey
ALTER TABLE `Snippet_tag` DROP FOREIGN KEY `Snippet_tag_tag_id_fkey`;

-- AddForeignKey
ALTER TABLE `Snippet` ADD CONSTRAINT `Snippet_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `Snippet_tag` ADD CONSTRAINT `Snippet_tag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Snippet_tag` ADD CONSTRAINT `Snippet_tag_snippet_id_fkey` FOREIGN KEY (`snippet_id`) REFERENCES `Snippet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
