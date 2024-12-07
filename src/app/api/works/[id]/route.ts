"use server";

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	const works = await prisma.job.findMany({
		where: {
			employerId: +id,
		},
	});

	if (works.length === 0) {
		return NextResponse.json(
			{ message: "Работы не найдены, создайте хотя бы одну!" },
			{ status: 200 }
		);
	}

	return NextResponse.json({ data: works }, { status: 200 });
}

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	try {
		// Извлечение данных из тела запроса
		const formData: {
			title: string;
			description: string;
		} = await request.json();

		const newJob = await prisma.job.create({
			data: {
				title: formData.title,
				description: formData.description,
				employerId: +id,
			},
		});

		return NextResponse.json(
			{ message: "Успешно добавлена работа!", data: newJob },
			{ status: 201 }
		);
	} catch (err) {
		return NextResponse.json(
			{ message: "Ошибка при добавлении работы" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: workId } = params;

	const deletedJob = await prisma.job.delete({
		where: {
			id: +workId,
		},
	});

	return NextResponse.json(
		{ message: "Работа успешно удалена" },
		{ status: 200 }
	);
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	try {
		// Извлечение данных из тела запроса
		const formData: {
			title: string;
			description: string;
			employerId: string;
		} = await request.json();

		const newJob = await prisma.job.update({
			where: {
				id: +id,
			},
			data: {
				title: formData.title,
				description: formData.description,
				employerId: +formData.employerId,
			},
		});

		return NextResponse.json(
			{ message: "Успешно обновлена работа работа!", data: newJob },
			{ status: 201 }
		);
	} catch (err) {
		return NextResponse.json(
			{ message: "Ошибка при обновлении работы" },
			{ status: 500 }
		);
	}
}
