import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// /api/vacancies/${testId}/test/question
export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: testId } = params;

	try {
		// Извлечение данных из тела запроса
		const formData: {
			questionText: string;
			option1: string;
			option2: string;
			option3: string;
			option4: string;
			correctAnswer: number;
		} = await request.json();

		const newTest = await prisma.question.create({
			data: {
				questionText: formData.questionText,
				option1: formData.option1,
				option2: formData.option2,
				option3: formData.option3,
				option4: formData.option4,
				correctAnswer: formData.correctAnswer,
				testId: +testId,
			},
		});

		return NextResponse.json(
			{ message: "Успешно добавлен тест!", data: newTest },
			{ status: 201 }
		);
	} catch (err) {
		console.error("Ошибка при добавлении вопроса:", err);
		return NextResponse.json(
			{ message: "Ошибка при добавлении теста!" },
			{ status: 500 }
		);
	}
}

// /api/vacancies/${testId}/test/question
export async function PUT(request: Request) {
	try {
		// Извлечение данных из тела запроса
		const formData: {
			id: number;
			questionText: string;
			option1: string;
			option2: string;
			option3: string;
			option4: string;
			correctAnswer: number;
		} = await request.json();

		const updatedTest = await prisma.question.update({
			where: {
				id: formData.id,
			},
			data: {
				questionText: formData.questionText,
				option1: formData.option1,
				option2: formData.option2,
				option3: formData.option3,
				option4: formData.option4,
				correctAnswer: formData.correctAnswer,
			},
		});

		return NextResponse.json(
			{ message: "Вопрос успешно обновлен!", data: updatedTest },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Ошибка при обновлении вопроса:", err);
		return NextResponse.json(
			{ message: "Ошибка при обновлении вопроса!" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: questionId } = params;

	await prisma.question.delete({
		where: {
			id: +questionId,
		},
	});

	return NextResponse.json(
		{ message: "Вопрос успешно удален" },
		{ status: 200 }
	);
}
