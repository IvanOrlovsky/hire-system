"use server";

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: workId } = params;

	const vacancies = await prisma.vacancy.findMany({
		where: {
			jobId: +workId,
		},
		include: {
			tags: {
				include: {
					tag: true,
				},
			},
			test: {
				include: {
					questions: true,
				},
			},
		},
	});

	if (vacancies.length === 0) {
		return NextResponse.json(
			{ message: "Вакансии не найдены, создайте хотя бы одну!" },
			{ status: 200 }
		);
	}

	return NextResponse.json({ data: vacancies }, { status: 200 });
}

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: workId } = params;

	try {
		// Извлечение данных из тела запроса
		const formData: {
			title: string;
			description: string;
			salary: number;
			tagsId: number[];
		} = await request.json();

		const allTags = await prisma.tag.findMany({
			where: {
				id: { in: formData.tagsId },
			},
		});

		const newVacancy = await prisma.vacancy.create({
			data: {
				jobId: +workId,
				title: formData.title,
				description: formData.description,
				salary: formData.salary,
				status: "open",
				tags: {
					create: allTags.map((tag) => ({ tagId: tag.id })),
				},
			},
		});

		return NextResponse.json(
			{ message: "Успешно добавлена вакансия!", data: newVacancy },
			{ status: 201 }
		);
	} catch (err) {
		return NextResponse.json(
			{ message: "Ошибка при добавлении вакансии!" },
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
			title: string;
			description: string;
			salary: number;
			tagsId: number[];
		} = await request.json();

		// Получение существующих тегов
		const allTags = await prisma.tag.findMany({
			where: {
				id: { in: formData.tagsId },
			},
		});

		// Обновление вакансии
		const updatedVacancy = await prisma.vacancy.update({
			where: { id: +vacancyId },
			data: {
				title: formData.title,
				description: formData.description,
				salary: formData.salary,
				tags: {
					deleteMany: {}, // Удаляем все существующие связи
					create: allTags.map((tag) => ({ tagId: tag.id })), // Создаем новые связи
				},
			},
		});

		return NextResponse.json(
			{ message: "Вакансия успешно обновлена!", data: updatedVacancy },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Ошибка при обновлении вакансии:", err);
		return NextResponse.json(
			{ message: "Ошибка при обновлении вакансии!" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: vacancyId } = params;

	await prisma.vacancy.delete({
		where: {
			id: +vacancyId,
		},
	});

	return NextResponse.json(
		{ message: "Вакансия успешно удалена" },
		{ status: 200 }
	);
}
