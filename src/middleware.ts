import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authedRoutes = ["/"];
const notAuthedRoutes = ["/login", "/registration"];
const applicantsRoutes = [""];
const employerRoutes = [""];

export async function middleware(request: NextRequest) {
	const userId = request.cookies.get("id")?.value;
	const role = request.cookies.get("role")?.value;

	const path = request.nextUrl.pathname;
	const isAuthedRoute = authedRoutes.includes(path);
	const isNotAuthedRoute = notAuthedRoutes.includes(path);
	const isApplicantRoute = applicantsRoutes.includes(path);
	const isEmployerRoute = employerRoutes.includes(path);

	const isUserAuthed = userId;

	// Если мы хотим попасть на маршруты, требующие входа, то возвращаем пользователя на вход, если он не вошел
	if (!isNotAuthedRoute && !isUserAuthed) {
		return NextResponse.redirect(new URL("/login", request.nextUrl));
	}

	// Если мы вошли в аккаунт, и при этом хотим попасть на регистрацию или вход, то возвращаем домой
	if (isUserAuthed && isNotAuthedRoute) {
		return NextResponse.redirect(new URL("/", request.nextUrl));
	}

	// Если соискатель пытается зайти на маршруты для работодателя, то возвращаем домой
	if (isEmployerRoute && role === "applicant") {
		return NextResponse.redirect(new URL("/", request.nextUrl));
	}

	// Если работодатель пытается зайти на маршруты для соискателя, то возвращаем домой
	if (isApplicantRoute && role === "employer") {
		return NextResponse.redirect(new URL("/", request.nextUrl));
	}

	// Если нет условий для редиректа, пропускаем запрос дальше
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
