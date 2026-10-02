import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const usuarioSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["GESTOR", "SECRETARIA", "PROFESSOR", "ALUNO"]).default("PROFESSOR"),
  alunoId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        alunoId: true,
        createdAt: true,
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = usuarioSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
      return NextResponse.json(
        { error: "Já existe um usuário com este e-mail" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.create({
      data: validation.data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
