import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const cursoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  cargaHoraria: z.number().int().positive().optional(),
  turma: z.string().optional(),
  ativo: z.boolean().default(true),
  professorId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const incluirInativos = searchParams.get("incluirInativos") === "true";

    const cursos = await prisma.curso.findMany({
      where: incluirInativos ? undefined : { ativo: true },
      include: {
        professor: {
          select: { id: true, nome: true, email: true },
        },
        _count: {
          select: {
            modulos: true,
            matriculas: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(cursos);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar cursos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = cursoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.create({
      data: validation.data,
    });

    return NextResponse.json(curso, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar curso" },
      { status: 500 }
    );
  }
}
