import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const conteudoSchema = z.object({
  moduloId: z.string().min(1, "O ID do módulo é obrigatório"),
  titulo: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  ordem: z.number().int().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = conteudoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { moduloId, titulo, descricao, ordem } = validation.data;

    let proximaOrdem = ordem;
    if (!proximaOrdem) {
      const ultimoConteudo = await prisma.conteudo.findFirst({
        where: { moduloId },
        orderBy: { ordem: "desc" },
      });
      proximaOrdem = (ultimoConteudo?.ordem ?? 0) + 1;
    }

    const conteudo = await prisma.conteudo.create({
      data: {
        moduloId,
        titulo,
        descricao,
        ordem: proximaOrdem,
      },
    });

    return NextResponse.json(conteudo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar conteúdo" },
      { status: 500 }
    );
  }
}
