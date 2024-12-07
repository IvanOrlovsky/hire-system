"use server";

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: vacancyId } = params;

	const test = await prisma.test.findUnique({
		where: {
			vacancyId: +vacancyId,
		},
	});

	return NextResponse.json({ data: test }, { status: 200 });
}

// model Test {
//     id          Int     @id @default(autoincrement())
//     vacancyId   Int     @unique
//     question    String
//     option1     String
//     option2     String
//     option3     String
//     option4     String
//     correctAnswer Int
//     vacancy     Vacancy @relation(fields: [vacancyId], references: [id])
//   }

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: vacancyId } = params;

	try {
		// Извлечение данных из тела запроса
		const formData: {
			question: string;
			option1: string;
			option2: string;
			option3: string;
			option4: string;
			correctAnswer: number;
		} = await request.json();

		const newTest = await prisma.test.create({
			data: {
				question: formData.question,
				option1: formData.option1,
				option2: formData.option2,
				option3: formData.option3,
				option4: formData.option4,
				correctAnswer: formData.correctAnswer,
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

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: vacancyId } = params;

	try {
		// Извлечение данных из тела запроса
		const formData: {
			testId: string;
			question: string;
			option1: string;
			option2: string;
			option3: string;
			option4: string;
			correctAnswer: number;
		} = await request.json();

		const updatedTest = await prisma.test.update({
			where: { vacancyId: +vacancyId },
			data: {
				question: formData.question,
				option1: formData.option1,
				option2: formData.option2,
				option3: formData.option3,
				option4: formData.option4,
				correctAnswer: formData.correctAnswer,
				vacancyId: +vacancyId,
			},
		});

		return NextResponse.json(
			{ message: "Тест успешно обновлен!", data: updatedTest },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Ошибка при обновлении теста:", err);
		return NextResponse.json(
			{ message: "Ошибка при обновлении теста!" },
			{ status: 500 }
		);
	}
}

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
