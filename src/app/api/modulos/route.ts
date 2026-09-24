import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const moduloSchema = z.object({
  cursoId: z.string().min(1, "O ID do curso é obrigatório"),
  nome: z.string().min(2, "O nome do módulo deve ter pelo menos 2 caracteres"),
  ordem: z.number().int().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = moduloSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { cursoId, nome, ordem } = validation.data;

    let proximaOrdem = ordem;
    if (!proximaOrdem) {
      const ultimoModulo = await prisma.modulo.findFirst({
        where: { cursoId },
        orderBy: { ordem: "desc" },
      });
      proximaOrdem = (ultimoModulo?.ordem ?? 0) + 1;
    }

    const modulo = await prisma.modulo.create({
      data: {
        cursoId,
        nome,
        ordem: proximaOrdem,
      },
    });

    return NextResponse.json(modulo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar módulo" },
      { status: 500 }
    );
  }
}
