-- Update existing stonemason structures to 3x3 footprint
UPDATE "Structure" SET "span" = 3 WHERE "structureType" = 'stonemason';
