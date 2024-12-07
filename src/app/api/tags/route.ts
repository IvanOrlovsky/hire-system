import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
	const tags = await prisma.tag.findMany();

	return NextResponse.json({ data: tags }, { status: 200 });
}
