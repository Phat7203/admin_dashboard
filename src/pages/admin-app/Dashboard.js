import React, { useEffect, useState } from "react";
import InfoCard from "../../components/Cards/InfoCard";
import ChartCard from "../../components/Chart/ChartCard";
import { Line } from "react-chartjs-2";
import ChartLegend from "../../components/Chart/ChartLegend";
import PageTitle from "../../components/Typography/PageTitle";
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon } from "../../icons";
import RoundIcon from "../../components/RoundIcon";
import { getSystemOverview, getMonthlyStats } from "../../api/AdminAppApi";

function DashBoardAdminApp() {
  const [overview, setOverview] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchOverview();
    fetchMonthlyStats();
  }, [selectedMonth, selectedYear]);

  const fetchOverview = async () => {
    try {
      const response = await getSystemOverview();
      setOverview(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy tổng quan hệ thống:", error);
      setOverview({ stores: 0, users: 0, products: 0, orders: 0 });
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await getMonthlyStats(selectedMonth, selectedYear);
      console.log(response.data);
      setMonthlyStats(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê tháng:", error);
      setMonthlyStats({
        dailyRevenue: [],
        dailyStats: [],
        todayRevenue: "0 VND",
        todayNewUsers: 0,
        todayNewProducts: 0,
        todayNewStores: 0
      });
    }
  };

  const handleMonthYearChange = () => {
    fetchMonthlyStats();
  };

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const revenueChartData = {
    labels: monthlyStats?.dailyRevenue?.map(item => `${item.day}/${selectedMonth}`) || [],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: monthlyStats?.dailyRevenue?.map(item => item.revenue) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        suggestedMin: 0,
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value);
          }
        }
      }
    }
  };

  const statsChartData = {
    labels: monthlyStats?.dailyStats?.map(item => `${item.day}/${selectedMonth}`) || [],
    datasets: [
      {
        label: 'User mới',
        data: monthlyStats?.dailyStats?.map(item => item.newUsers) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Sản phẩm mới',
        data: monthlyStats?.dailyStats?.map(item => item.newProducts) || [],
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Cửa hàng mới',
        data: monthlyStats?.dailyStats?.map(item => item.newStores) || [],
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  };

  const statsChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        suggestedMin: 0,
        beginAtZero: true,
        ticks: { stepSize: 2 }
      }
    }
  };

  const revenueChartLegends = [
    {
      title: `Doanh thu ${selectedMonth}/${selectedYear}`,
      color: 'bg-blue-500',
      value: monthlyStats?.todayRevenue || '0 VND'
    }
  ];

  const statsChartLegends = [
    {
      title: `User mới ${selectedMonth}/${selectedYear}`,
      color: 'bg-green-500',
      value: monthlyStats?.todayNewUsers || '0'
    },
    {
      title: `Sản phẩm mới ${selectedMonth}/${selectedYear}`,
      color: 'bg-purple-500',
      value: monthlyStats?.todayNewProducts || '0'
    },
    {
      title: `Cửa hàng mới ${selectedMonth}/${selectedYear}`,
      color: 'bg-orange-500',
      value: monthlyStats?.todayNewStores || '0'
    }
  ];

  return (
    <div className="container mx-auto px-4">
      <PageTitle>Tổng quan</PageTitle>

      {/* Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Tổng số cửa hàng" value={overview ? overview.stores.toLocaleString() : "..."}>
          <RoundIcon
            icon={PeopleIcon}
            iconColorClass="text-orange-500 dark:text-orange-100"
            bgColorClass="bg-orange-100 dark:bg-orange-500"
            className="mr-4"
          />
        </InfoCard>
        <InfoCard title="Tổng số khách hàng" value={overview ? overview.users.toLocaleString() : "..."}>
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>
        <InfoCard title="Tổng số sản phẩm" value={overview ? overview.products.toLocaleString() : "..."}>
          <RoundIcon
            icon={CartIcon}
            iconColorClass="text-blue-500 dark:text-blue-100"
            bgColorClass="bg-blue-100 dark:bg-blue-500"
            className="mr-4"
          />
        </InfoCard>
        <InfoCard title="Tổng số đơn hàng" value={overview ? overview.orders.toLocaleString() : "..."}>
          <RoundIcon
            icon={ChatIcon}
            iconColorClass="text-teal-500 dark:text-teal-100"
            bgColorClass="bg-teal-100 dark:bg-teal-500"
            className="mr-4"
          />
        </InfoCard>
      </div>

      {/* Control Panel */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Tháng:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Năm:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleMonthYearChange}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
          >
            Cập nhật
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Đang xem: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </div>
        </div>
      </div>

      {/* Charts - Mỗi biểu đồ một hàng */}
      <div className="grid gap-6 mb-8">
        <div className="w-full">
          <ChartCard title={`Doanh thu theo ngày - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}>
            <Line data={revenueChartData} options={revenueChartOptions} />
            <ChartLegend legends={revenueChartLegends} />
          </ChartCard>
        </div>
        <div className="w-full">
          <ChartCard title={`Thống kê tăng trưởng - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}>
            <Line data={statsChartData} options={statsChartOptions} />
            <ChartLegend legends={statsChartLegends} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default DashBoardAdminApp;