"use server";

import prisma from "@/lib/db";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	const applicant = await prisma.applicant.findUnique({
		where: {
			id: +id,
		},
	});

	return Response.json(applicant);
}
