import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const moduloUpdateSchema = z.object({
  nome: z.string().min(2, "O nome do módulo deve ter pelo menos 2 caracteres").optional(),
  ordem: z.number().int().min(1).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = moduloUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const modulo = await prisma.modulo.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(modulo);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar módulo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.modulo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Módulo excluído com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir módulo" },
      { status: 500 }
    );
  }
}
