import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const cursoUpdateSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
  descricao: z.string().optional(),
  cargaHoraria: z.number().int().positive().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: params.id },
      include: {
        modulos: {
          orderBy: { ordem: "asc" },
          include: {
            conteudos: {
              orderBy: { ordem: "asc" },
            },
          },
        },
        matriculas: {
          include: {
            aluno: true,
          },
          orderBy: {
            aluno: { nome: "asc" },
          },
        },
      },
    });

    if (!curso) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(curso);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar detalhes do curso" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = cursoUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(curso);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar curso" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.curso.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Curso removido com sucesso" });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir curso" },
      { status: 500 }
    );
  }
}
