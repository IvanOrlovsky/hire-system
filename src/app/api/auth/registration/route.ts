import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
	try {
		const formData: {
			name: string;
			email: string;
			password: string;
			role: "employer" | "seeker";
		} = await request.json();

		// Общие данные для создания пользователя
		const userData = {
			name: formData.name,
			email: formData.email,
			password: formData.password,
		};

		// Логика создания пользователя в зависимости от роли
		let user;
		if (formData.role === "employer") {
			user = await prisma.employer.create({ data: userData });
		} else if (formData.role === "seeker") {
			user = await prisma.applicant.create({
				data: { ...userData, status: "inactive" },
			});
		} else {
			return NextResponse.json(
				{ message: "Неверная роль пользователя" },
				{ status: 400 }
			);
		}

		const message =
			formData.role === "employer"
				? "Добро пожаловать, работодатель"
				: "Добро пожаловать, соискатель";

		return NextResponse.json({ message, data: user }, { status: 201 });
	} catch (err: any) {
		// Обработка ошибки уникальности почты
		if (err.code === "P2002" && err.meta?.target?.includes("email")) {
			return NextResponse.json(
				{ message: "Пользователь с таким email уже существует" },
				{ status: 409 }
			);
		}

		console.error("Ошибка при регистрации:", err);

		return NextResponse.json(
			{ message: "Ошибка при регистрации" },
			{ status: 500 }
		);
	}
}
