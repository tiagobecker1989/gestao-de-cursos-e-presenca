import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const matriculaSchema = z.object({
  alunoId: z.string().min(1, "O ID do aluno é obrigatório"),
  cursoId: z.string().min(1, "O ID do curso é obrigatório"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = matriculaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { alunoId, cursoId } = validation.data;

    const matriculaExistente = await prisma.matricula.findUnique({
      where: {
        alunoId_cursoId: {
          alunoId,
          cursoId,
        },
      },
    });

    if (matriculaExistente) {
      return NextResponse.json(
        { error: "Aluno já está matriculado neste curso" },
        { status: 400 }
      );
    }

    const matricula = await prisma.matricula.create({
      data: {
        alunoId,
        cursoId,
      },
      include: {
        aluno: true,
        curso: true,
      },
    });

    return NextResponse.json(matricula, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao efetuar matrícula" },
      { status: 500 }
    );
  }
}
