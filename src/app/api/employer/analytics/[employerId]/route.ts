import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { employerId: string } }
) {
	const { employerId } = params;

	try {
		const employerIdNum = parseInt(employerId);

		if (isNaN(employerIdNum)) {
			return NextResponse.json(
				{ message: "Некорректный ID работодателя" },
				{ status: 400 }
			);
		}

		const employer = await prisma.employer.findUnique({
			where: { id: employerIdNum },
			include: {
				jobs: {
					include: {
						vacancies: {
							include: {
								applications: true,
							},
						},
					},
				},
			},
		});

		if (!employer) {
			return NextResponse.json(
				{ message: "Работодатель не найден" },
				{ status: 404 }
			);
		}

		// Подсчет статистики
		const totalJobs = employer.jobs.length;
		const allVacancies = employer.jobs.flatMap((job) => job.vacancies);
		const totalVacancies = allVacancies.length;
		const activeVacancies = allVacancies.filter(
			(vacancy) => vacancy.status === "active"
		).length;
		const totalApplications = allVacancies.reduce(
			(sum, vacancy) => sum + vacancy.applications.length,
			0
		);
		const averageApplicationsPerVacancy =
			totalVacancies > 0 ? totalApplications / totalVacancies : 0;

		const statistics = {
			totalJobs,
			totalVacancies,
			activeVacancies,
			totalApplications,
			averageApplicationsPerVacancy,
		};

		return NextResponse.json({ data: statistics }, { status: 200 });
	} catch (err) {
		console.error(
			"Ошибка при получении статистики для работодателя: \n" + err
		);
		return NextResponse.json(
			{ message: "Ошибка при получении статистики для работодателя" },
			{ status: 500 }
		);
	}
}
