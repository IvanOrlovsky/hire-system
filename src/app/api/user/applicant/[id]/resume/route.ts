import prisma from "@/lib/db";
import { Resume } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	try {
		const resume = await prisma.resume.findUnique({
			where: {
				applicantId: +applicantId,
			},
		});

		return NextResponse.json({ data: resume }, { status: 200 });
	} catch (err) {
		console.error("Ошибка при получении резюме \n " + err);
		return NextResponse.json(
			{ message: "Ошибка при получении резюме" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	const { personalInfo, workExperience } = await request.json();

	try {
		const newResume = await prisma.resume.update({
			where: {
				applicantId: +applicantId,
			},
			data: {
				personalInfo,
				workExperience,
			},
		});

		return NextResponse.json({ data: newResume }, { status: 200 });
	} catch (err) {
		console.error("Ошибка при изменении резюме \n " + err);
		return NextResponse.json(
			{ message: "Ошибка при изменении резюме" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	const { personalInfo, workExperience } = await request.json();

	try {
		const newResume = await prisma.resume.create({
			data: {
				applicantId: +applicantId,
				personalInfo,
				workExperience,
			},
		});

		return NextResponse.json({ data: newResume }, { status: 200 });
	} catch (err) {
		console.error("Ошибка при изменении резюме \n " + err);
		return NextResponse.json(
			{ message: "Ошибка при изменении резюме" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	try {
		await prisma.resume.delete({
			where: {
				applicantId: +applicantId,
			},
		});

		return NextResponse.json(
			{ message: "Резюме успешно удалено" },
			{ status: 200 }
		);
	} catch (err) {
		console.error("Ошибка при удалении резюме \n " + err);
		return NextResponse.json(
			{ message: "Ошибка при удалении резюме" },
			{ status: 500 }
		);
	}
}
