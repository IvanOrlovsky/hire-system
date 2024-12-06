import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
	try {
		// Извлечение данных из тела запроса
		const formData: {
			email: string;
			password: string;
			role: "employer" | "seeker";
		} = await request.json();

		// Определение таблицы в зависимости от роли
		const user =
			formData.role === "employer"
				? await prisma.employer.findUnique({
						where: { email: formData.email },
				  })
				: await prisma.applicant.findUnique({
						where: { email: formData.email },
				  });

		// Проверка существования пользователя
		if (!user) {
			return NextResponse.json(
				{ message: "Пользователь с таким email не найден" },
				{ status: 404 }
			);
		}

		// Проверка пароля
		if (user.password !== formData.password) {
			return NextResponse.json(
				{ message: "Неверный пароль" },
				{ status: 401 }
			);
		}

		// Успешный вход
		return NextResponse.json(
			{
				message: "Вход успешно выполнен",
				data: { id: user.id, role: formData.role, name: user.name },
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error("Ошибка при входе:", err);
		return NextResponse.json(
			{ message: "Произошла ошибка при входе" },
			{ status: 500 }
		);
	}
}
