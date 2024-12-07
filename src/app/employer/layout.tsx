import EmployerSideBar from "@/components/EmployerSideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<EmployerSideBar />
			<main className="ml-72 mt-6">{children}</main>
		</>
	);
}
