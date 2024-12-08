	"use server";

	import prisma from "@/lib/db";
	import { NextResponse } from "next/server";

	// /api/vacancies/${vacancyId}/test
	export async function GET(
		request: Request,
		{ params }: { params: { id: string } }
	) {
		const { id: vacancyId } = params;

		const test = await prisma.test.findMany({
			where: {
				vacancyId: +vacancyId,
			},
			include: {
				questions: true,
			},
		});

		return NextResponse.json({ data: test }, { status: 200 });
	}

	// /api/vacancies/${vacancyId}/test
	export async function POST(
		request: Request,
		{ params }: { params: { id: string } }
	) {
		const { id: vacancyId } = params;

		try {
			const newTest = await prisma.test.create({
				data: {
					vacancyId: +vacancyId,
				},
			});

			return NextResponse.json(
				{ message: "Успешно добавлен тест!", data: newTest },
				{ status: 201 }
			);
		} catch (err) {
			return NextResponse.json(
				{ message: "Ошибка при добавлении теста!" },
				{ status: 500 }
			);
		}
	}

	// /api/vacancies/${vacancyId}/test
	export async function DELETE(
		request: Request,
		{ params }: { params: { id: string } }
	) {
		const { id: vacancyId } = params;

		await prisma.test.delete({
			where: {
				id: +vacancyId,
			},
		});

		return NextResponse.json(
			{ message: "Тест успешно удален" },
			{ status: 200 }
		);
	}
