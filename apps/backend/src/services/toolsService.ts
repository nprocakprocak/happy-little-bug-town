import { prisma } from "../lib/prisma.js";
import { CreateToolData, ToolDto, UpdateToolData } from "../types/toolDto.js";
import { toToolDto } from "./helpers.js";

export const createTool = async (tool: CreateToolData): Promise<ToolDto> => {
  const createdTool = await prisma.tool.create({
    data: {
      toolType: tool.toolType,
      x: tool.x,
      y: tool.y,
      authorId: tool.authorId,
    },
  });
  return toToolDto({ ...createdTool, items: [] });
};

export const updateTool = async (id: string, data: UpdateToolData): Promise<ToolDto> => {
  const updateData = data.structureId
    ? { structureId: data.structureId, x: null, y: null }
    : { x: data.x, y: data.y, structureId: null };

  const updatedTool = await prisma.tool.update({
    where: { id },
    data: updateData,
    include: { items: true },
  });
  return toToolDto(updatedTool);
};
