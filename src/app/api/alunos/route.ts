import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const alunoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
  observacaoProfessor: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const incluirInativos = searchParams.get("incluirInativos") === "true";

    const alunos = await prisma.aluno.findMany({
      where: incluirInativos ? undefined : { ativo: true },
      include: {
        _count: {
          select: {
            matriculas: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(alunos);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = alunoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, cpf, nome, ativo, observacaoProfessor } = validation.data;

    const emailExistente = await prisma.aluno.findUnique({
      where: { email },
    });

    if (emailExistente) {
      return NextResponse.json(
        { error: "Já existe um aluno cadastrado com este e-mail" },
        { status: 400 }
      );
    }

    if (cpf) {
      const cpfExistente = await prisma.aluno.findUnique({
        where: { cpf },
      });
      if (cpfExistente) {
        return NextResponse.json(
          { error: "Já existe um aluno cadastrado com este CPF" },
          { status: 400 }
        );
      }
    }

    const tokenAcesso = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        email,
        cpf,
        ativo,
        observacaoProfessor,
        tokenAcesso,
      },
    });

    return NextResponse.json(aluno, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao cadastrar aluno" },
      { status: 500 }
    );
  }
}
