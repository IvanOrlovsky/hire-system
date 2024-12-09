"use client";

import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Card, Table, Tag, Spin } from "antd";

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

export default function ApplicantAnalytics({
	params,
}: {
	params: { id: string };
}) {
	const { id: applicantId } = params;
	const [analyticsData, setAnalyticsData] = useState<any>();
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const { data: analyticsData } = await apiCall(
				"get",
				`/api/applicant/analytics/${applicantId}`
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
	}, [fetchData]);

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
		totalApplications,
		acceptedApplications,
		rejectedApplications,
		averageTestScore,
		completedTests,
		tags,
	} = analyticsData;

	const tableData = [
		{
			key: "1",
			metric: "Всего заявок",
			value: totalApplications,
		},
		{
			key: "2",
			metric: "Принятые заявки",
			value: acceptedApplications,
		},
		{
			key: "3",
			metric: "Отклоненные заявки",
			value: rejectedApplications,
		},
		{
			key: "4",
			metric: "Средний результат тестов",
			value: `${averageTestScore.toFixed(2)}%`,
		},
		{
			key: "5",
			metric: "Пройдено тестов",
			value: completedTests,
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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				<Card
					title="Теги вакансий"
					bordered
					className="shadow-md"
					style={{ backgroundColor: "#fafafa" }}
				>
					<div className="flex flex-wrap gap-2">
						{tags.length > 0 ? (
							tags.map((tag: string) => (
								<Tag color="blue" key={tag}>
									{tag}
								</Tag>
							))
						) : (
							<p className="text-gray-500">Нет тегов</p>
						)}
					</div>
				</Card>
				<Card
					title="Общая информация"
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
