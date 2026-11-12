-- Persist manual text-color ranges for each editor tab.
ALTER TABLE "SnippetEditorTab"
ADD COLUMN "coloredRanges" JSONB NOT NULL DEFAULT '[]';
