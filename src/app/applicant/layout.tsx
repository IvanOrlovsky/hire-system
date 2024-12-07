import ApplicantSideBar from "@/components/ApplicantSideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<ApplicantSideBar />
			<main className="ml-72 mt-6">{children}</main>
		</>
	);
}
	