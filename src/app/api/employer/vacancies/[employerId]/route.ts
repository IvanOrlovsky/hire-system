import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { employerId: string } }
) {
	const { employerId } = params;

	try {
		const vacancies = await prisma.vacancy.findMany({
			where: {
				job: {
					employerId: +employerId,
				},
				applicantTestResult: {
					some: {},
				},
			},
			include: {
				applications: {
					include: {
						applicant: {
							include: {
								resumes: true,
							},
						},
					},
				},
				applicantTestResult: true,
			},
		});

		return NextResponse.json({ data: vacancies }, { status: 200 });
	} catch (err) {
		return NextResponse.json(
			{ error: "Не удалось получить отклики по вакансиям" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	const accept = request.nextUrl.searchParams.get("accept");
	const applicantId = request.nextUrl.searchParams.get(
		"applicantId"
	) as string;
	const vacancyId = request.nextUrl.searchParams.get("vacancyId") as string;

	try {
		if (accept) {
			await prisma.vacancyApplication.update({
				where: {
					vacancyId_applicantId: {
						vacancyId: +vacancyId,
						applicantId: +applicantId,
					},
				},

				data: { status: "accepted" },
			});
		} else {
			await prisma.vacancyApplication.update({
				where: {
					vacancyId_applicantId: {
						vacancyId: +vacancyId,
						applicantId: +applicantId,
					},
				},

				data: { status: "rejected" },
			});
		}

		return NextResponse.json(
			{ message: "Изменения сохранены" },
			{ status: 200 }
		);
	} catch (err) {
		console.log("Ошибка при принятии/отклонении отклика \n" + err);
		return NextResponse.json(
			{ error: "Не удалось сохранить изменения" },
			{ status: 500 }
		);
	}
}
