import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const notaSchema = z.object({
  alunoId: z.string().min(1, "O ID do aluno é obrigatório"),
  moduloId: z.string().min(1, "O ID do módulo é obrigatório"),
  valor: z.number().min(0, "A nota deve ser maior ou igual a 0").max(10, "A nota deve ser no máximo 10"),
  participativo: z.boolean().default(false),
  observacao: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = notaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { alunoId, moduloId, valor, participativo, observacao } = validation.data;

    const nota = await prisma.nota.upsert({
      where: {
        alunoId_moduloId: {
          alunoId,
          moduloId,
        },
      },
      update: {
        valor,
        participativo,
        observacao,
      },
      create: {
        alunoId,
        moduloId,
        valor,
        participativo,
        observacao,
      },
    });

    return NextResponse.json(nota);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao salvar nota" },
      { status: 500 }
    );
  }
}
