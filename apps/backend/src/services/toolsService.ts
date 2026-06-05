import { prisma } from "../lib/prisma.js";
import { CreateToolData, ToolDto, UpdateToolData } from "../types/toolDto.js";
import { toToolDto } from "./helpers.js";

const toolInclude = { items: true } as const;

export const getTools = async (authorId: string): Promise<ToolDto[]> => {
  const tools = await prisma.tool.findMany({
    where: { authorId },
    include: toolInclude,
  });
  return tools.map(toToolDto);
};

export const getTool = async (id: string): Promise<ToolDto | null> => {
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: toolInclude,
  });
  return tool ? toToolDto(tool) : null;
};

export const createTool = async (tool: CreateToolData): Promise<ToolDto> => {
  const createdTool = await prisma.tool.create({
    data: {
      toolType: tool.toolType,
      x: tool.x,
      y: tool.y,
      authorId: tool.authorId,
    },
    include: toolInclude,
  });
  return toToolDto(createdTool);
};

export const updateTool = async (id: string, data: UpdateToolData): Promise<ToolDto> => {
  const updateData = data.structureId
    ? { structureId: data.structureId, x: null, y: null }
    : { x: data.x, y: data.y, structureId: null };

  const updatedTool = await prisma.tool.update({
    where: { id },
    data: updateData,
    include: toolInclude,
  });
  return toToolDto(updatedTool);
};
