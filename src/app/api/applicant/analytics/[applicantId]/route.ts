import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { applicantId: string } }
) {
	const { applicantId } = params;

	try {
		// Преобразуем ID в число
		const applicantIdNum = parseInt(applicantId);

		if (isNaN(applicantIdNum)) {
			return NextResponse.json(
				{ message: "Некорректный ID соискателя" },
				{ status: 400 }
			);
		}

		// Получение статистики
		const analyticsData = await prisma.applicant.findUnique({
			where: { id: applicantIdNum },
			include: {
				applications: true,
				testResults: true,
				resumes: true,
			},
		});

		if (!analyticsData) {
			return NextResponse.json(
				{ message: "Соискатель не найден" },
				{ status: 404 }
			);
		}

		const totalApplications = analyticsData.applications.length;
		const acceptedApplications = analyticsData.applications.filter(
			(app) => app.status === "accepted"
		).length;
		const rejectedApplications = analyticsData.applications.filter(
			(app) => app.status === "rejected"
		).length;
		const testScores = analyticsData.testResults.map(
			(result) => result.score
		);
		const averageTestScore =
			testScores.reduce((sum, score) => sum + score, 0) /
				testScores.length || 0;
		const completedTests = analyticsData.testResults.length;
		const relatedVacancyIds = analyticsData.applications.map(
			(app) => app.vacancyId
		);

		const relatedTags = await prisma.tag.findMany({
			where: {
				vacancies: {
					some: {
						vacancyId: { in: relatedVacancyIds },
					},
				},
			},
			select: {
				name: true,
			},
		});

		const statistics = {
			totalApplications,
			acceptedApplications,
			rejectedApplications,
			averageTestScore,
			completedTests,
			tags: relatedTags.map((tag) => tag.name),
		};

		return NextResponse.json({ data: statistics }, { status: 200 });
	} catch (err) {
		console.error(
			"Ошибка при получении аналитики для соискателя: \n" + err
		);
		return NextResponse.json(
			{ message: "Ошибка при получении аналитики для соискателя" },
			{ status: 500 }
		);
	}
}
