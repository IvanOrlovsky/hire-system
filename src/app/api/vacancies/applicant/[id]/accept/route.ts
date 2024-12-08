import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	const hasTest = request.nextUrl.searchParams.get("hasTest");

	try {
		const formData = await request.json();

		if (hasTest) {
			const {
				vacancyId,
				testInfo,
			}: {
				vacancyId: string;
				testInfo: Array<{ questionId: number; answerNumber: number }>;
			} = formData;

			// Получаем все вопросы для данного теста
			const questions = await prisma.question.findMany({
				where: {
					test: {
						vacancyId: +vacancyId,
					},
				},
			});

			if (questions.length === 0) {
				return NextResponse.json(
					{ message: "Вопросы для теста не найдены" },
					{ status: 404 }
				);
			}

			// Проверяем ответы
			const correctAnswers = questions.reduce((sum, question) => {
				const userAnswer = testInfo.find(
					(info) => info.questionId === question.id
				);
				if (
					userAnswer &&
					userAnswer.answerNumber === question.correctAnswer
				) {
					return sum + 1;
				}
				return sum;
			}, 0);

			// Вычисляем результат в процентах
			const score = (correctAnswers / questions.length) * 100;

			// Сохраняем результат теста
			await prisma.applicantTestResult.create({
				data: {
					applicantId: +applicantId,
					vacancyId: +vacancyId,
					score: score,
				},
			});

			// Создаем заявку на вакансию
			await prisma.vacancyApplication.create({
				data: {
					vacancyId: +vacancyId,
					applicantId: +applicantId,
					status: score >= 50 ? "pending" : "failed", // считаем, что 50% - минимальный проходной балл
				},
			});

			return NextResponse.json(
				{ message: `Тест завершен, ваш результат: ${score}%` },
				{ status: 201 }
			);
		} else {
			const { vacancyId }: { vacancyId: string } = formData;

			// Создаем заявку на вакансию без теста
			await prisma.vacancyApplication.create({
				data: {
					vacancyId: +vacancyId,
					applicantId: +applicantId,
					status: "pending",
				},
			});

			return NextResponse.json(
				{ message: "Успешно оставлен отклик!" },
				{ status: 201 }
			);
		}
	} catch (err) {
		console.error("Ошибка при обработке отклика:", err);
		return NextResponse.json(
			{ message: "Ошибка при проставке отклика!" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	const vacancyId = request.nextUrl.searchParams.get("vacancyId") || "";

	try {
		await prisma.vacancyApplication.delete({
			where: {
				vacancyId_applicantId: {
					applicantId: +applicantId,
					vacancyId: +vacancyId,
				},
			},
		});

		await prisma.applicantTestResult.delete({
			where: {
				applicantId_vacancyId: {
					applicantId: +applicantId,
					vacancyId: +vacancyId,
				},
			},
		});

		return NextResponse.json(
			{ message: "Успешно удален отклик!" },
			{ status: 201 }
		);
	} catch (err) {
		console.error("Ошибка при обработке отклика:", err);
		return NextResponse.json(
			{ message: "Ошибка при проставке отклика!" },
			{ status: 500 }
		);
	}
}
