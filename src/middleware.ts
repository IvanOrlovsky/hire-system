import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authedRoutes = ["/employer", "/applicant"];
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
		return NextResponse.redirect(
			new URL(`/applicant/vacancies/${userId}`, request.nextUrl)
		);
	}

	// Если работодатель пытается зайти на маршруты для соискателя, то возвращаем домой
	if (isApplicantRoute && role === "employer") {
		return NextResponse.redirect(
			new URL(`/employer/works/${userId}`, request.nextUrl)
		);
	}

	// Если пользователь хочет зайти на главную, то в зависимости от роли переводим его на другие страницы
	if (request.nextUrl.pathname === "/") {
		if (role === "applicant") {
			return NextResponse.redirect(
				new URL(`/applicant/vacancies/${userId}`, request.nextUrl)
			);
		}
		return NextResponse.redirect(
			new URL(`/employer/works/${userId}`, request.nextUrl)
		);
	}

	// Если нет условий для редиректа, пропускаем запрос дальше
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
