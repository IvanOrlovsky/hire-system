"use server";

import prisma from "@/lib/db";
import {
	Employer,
	Job,
	Question,
	Tag,
	TagsOnVacancies,
	Test,
	Vacancy,
	VacancyApplication,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type VacancyType = {
	test: ({ questions: Question[] } & Test) | null;
	tags: ({ tag: Tag } & TagsOnVacancies)[];
	job: { employer: Employer } & Job;
	applications: VacancyApplication[];
} & Vacancy;

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { id: applicantId } = params;

	const areAccepted = request.nextUrl.searchParams.get("areAccepted");

	let vacancies: VacancyType[] = [];

	if (!areAccepted) {
		vacancies = await prisma.vacancy.findMany({
			where: {
				status: "open",
				applications: {
					none: {
						applicantId: +applicantId,
					},
				},
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
				job: {
					include: {
						employer: true,
					},
				},
				applications: true,
			},
		});
	} else {
		vacancies = await prisma.vacancy.findMany({
			where: {
				applications: {
					some: {
						applicantId: +applicantId,
					},
				},
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
				job: {
					include: {
						employer: true,
					},
				},
				applications: {
					where: {
						applicantId: +applicantId,
					},
				},
			},
		});
	}

	return NextResponse.json({ data: vacancies }, { status: 200 });
}
