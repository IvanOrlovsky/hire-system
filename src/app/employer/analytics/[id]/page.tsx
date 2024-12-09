"use client";

import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Card, Table, Spin } from "antd";

const apiCall = async (
	method: "get" | "post" | "put" | "delete" | "patch",
	url: string,
	data?: any
) => {
	try {
		const response = await axios[method](url, data);
		return response.data;
	} catch (error) {
		toast.error("Ошибка соединения \n " + error);
		throw error;
	}
};

export default function EmployerAnalytics({
	params,
}: {
	params: { id: string };
}) {
	const { id: employerId } = params;
	const [analyticsData, setAnalyticsData] = useState<any>();
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const { data: analyticsData } = await apiCall(
				"get",
				`/api/employer/analytics/${employerId}`
			);

			setAnalyticsData(analyticsData);
		} catch (err) {
			toast.error("Ошибка при получении аналитики: \n" + err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [employerId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Spin size="large" />
			</div>
		);
	}

	if (!analyticsData) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg text-gray-500">
					Нет данных для отображения
				</p>
			</div>
		);
	}

	const {
		totalVacancies,
		activeVacancies,
		totalApplications,
		averageApplicationsPerVacancy,
	} = analyticsData;

	const tableData = [
		{
			key: "1",
			metric: "Всего вакансий",
			value: totalVacancies,
		},
		{
			key: "2",
			metric: "Активные вакансии",
			value: activeVacancies,
		},
		{
			key: "3",
			metric: "Всего заявок",
			value: totalApplications,
		},
		{
			key: "4",
			metric: "Среднее количество заявок на вакансию",
			value: averageApplicationsPerVacancy.toFixed(2),
		},
	];

	const columns = [
		{
			title: "Показатель",
			dataIndex: "metric",
			key: "metric",
		},
		{
			title: "Значение",
			dataIndex: "value",
			key: "value",
			render: (value: any) => (
				<span className="font-medium text-gray-700">{value}</span>
			),
		},
	];

	return (
		<div className="container mx-auto p-6">
			<Toaster />
			<div className="grid grid-cols-1 gap-6 mb-8">
				<Card
					title="Общая информация о вакансиях"
					bordered
					className="shadow-md"
					style={{ backgroundColor: "#fafafa" }}
				>
					<Table
						dataSource={tableData}
						columns={columns}
						pagination={false}
						bordered
					/>
				</Card>
			</div>
		</div>
	);
}
