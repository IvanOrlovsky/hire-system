import { Applicant, Employer } from "@prisma/client";

export function isApplicant(user: any): user is Applicant {
	return (
		user &&
		typeof user.id === "number" &&
		typeof user.name === "string" &&
		typeof user.email === "string" &&
		typeof user.password === "string" &&
		typeof user.name === "string"
	);
}

export function isEmployer(user: any): user is Employer {
	return (
		user &&
		typeof user.id === "number" &&
		typeof user.name === "string" &&
		typeof user.email === "string" &&
		typeof user.password === "string"
	);
}
