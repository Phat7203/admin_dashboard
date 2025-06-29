import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import InfoCard from "../components/Cards/InfoCard";
import ChartCard from "../components/Chart/ChartCard";
import { Line } from "react-chartjs-2";
import ChartLegend from "../components/Chart/ChartLegend";
import PageTitle from "../components/Typography/PageTitle";
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon } from "../icons";
import RoundIcon from "../components/RoundIcon";

import { getMonthlyStatsStore, getOverviewStore, getStoreById } from "../api/StoreApi";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const history = useHistory();
  const [overview, setOverview] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [storeStatus, setStoreStatus] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleMonthYearChange = () => {
    fetchMonthlyStats();
  };

  const handleBackToLogin = () => {
    logout()
    history.push("/login");
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

  const revenueChartLegends = [
    {
      title: `Doanh thu ${selectedMonth}/${selectedYear}`,
      color: 'bg-blue-500',
      value: monthlyStats?.todayRevenue || '0 VND'
    }
  ];

  // Kiểm tra trạng thái cửa hàng
  const checkStoreStatus = async () => {
    try {
      if (user?.storeId) {
        const response = await getStoreById(user.storeId);
        if (response.status === 200 && response.data) {
          const store = response.data;
          setStoreStatus(store.status);
          // Kiểm tra nếu cửa hàng chưa được kích hoạt
          if (store.status !== 'active') {
            setShowInactiveModal(true);
            return false; // Trả về false để không load dữ liệu dashboard
          }
        } else {
          // Nếu không lấy được thông tin cửa hàng
          setShowInactiveModal(true);
          return false;
        }
      }
      return true; // Cửa hàng đã được kích hoạt
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái cửa hàng:", error);
      setShowInactiveModal(true);
      return false;
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await getOverviewStore(user.storeId);
      setOverview(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy tổng quan hệ thống:", error);
      setOverview({
        totalOrders: 0,
        totalMessages: 0,
        totalProducts: 0,
        totalIncome: 0,
      });
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await getMonthlyStatsStore(
        user.storeId,
        selectedMonth,
        selectedYear
      );
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
        todayNewStores: 0,
      });
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const isStoreActive = await checkStoreStatus();
      // Chỉ load dữ liệu dashboard nếu cửa hàng đã được kích hoạt
      if (isStoreActive) {
        fetchOverview();
        fetchMonthlyStats();
      }
    };

    if (user?.storeId) {
      initializeDashboard();
    }
  }, [user]);

  // Modal thông báo cửa hàng chưa được kích hoạt
  const InactiveStoreModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div className="text-center">
          {/* Icon cảnh báo */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg 
              className="h-6 w-6 text-red-600 dark:text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          {/* Tiêu đề */}
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tài khoản chưa được kích hoạt
          </h3>
          
          {/* Nội dung */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Cửa hàng của bạn chưa được kích hoạt bởi quản trị viên. 
            Vui lòng liên hệ với admin để được hỗ trợ kích hoạt tài khoản.
          </p>
          
          {/* Thông tin trạng thái (nếu có) */}
          {storeStatus && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Trạng thái hiện tại: <span className="font-medium text-red-600 dark:text-red-400">{storeStatus}</span>
              </p>
            </div>
          )}
          
          {/* Button */}
          <button
            onClick={handleBackToLogin}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Trở về đăng nhập
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal thông báo cửa hàng chưa được kích hoạt */}
      {showInactiveModal && <InactiveStoreModal />}
      
      {/* Chỉ hiển thị nội dung dashboard nếu cửa hàng đã được kích hoạt */}
      {!showInactiveModal && (
        <>
          <PageTitle>Dashboard</PageTitle>

          {/* <CTA /> */}
          {/* <!-- Cards --> */}
          <div className="container mx-auto px-4">
            <PageTitle>Tổng quan</PageTitle>

            {/* Cards */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                title="Tổng số đơn hàng"
                value={overview ? overview.totalOrders.toLocaleString() : "..."}
              >
                <RoundIcon
                  icon={PeopleIcon}
                  iconColorClass="text-orange-500 dark:text-orange-100"
                  bgColorClass="bg-orange-100 dark:bg-orange-500"
                  className="mr-4"
                />
              </InfoCard>
              <InfoCard
                title="Tổng số doanh thu"
                value={overview ? overview.totalIncome.toLocaleString() : "..."}
              >
                <RoundIcon
                  icon={MoneyIcon}
                  iconColorClass="text-green-500 dark:text-green-100"
                  bgColorClass="bg-green-100 dark:bg-green-500"
                  className="mr-4"
                />
              </InfoCard>
              <InfoCard
                title="Tổng số sản phẩm"
                value={overview ? overview.totalProducts.toLocaleString() : "..."}
              >
                <RoundIcon
                  icon={CartIcon}
                  iconColorClass="text-blue-500 dark:text-blue-100"
                  bgColorClass="bg-blue-100 dark:bg-blue-500"
                  className="mr-4"
                />
              </InfoCard>
              <InfoCard
                title="Tổng số tin nhắn"
                value={overview ? overview.totalMessages.toLocaleString() : "..."}
              >
                <RoundIcon
                  icon={ChatIcon}
                  iconColorClass="text-teal-500 dark:text-teal-100"
                  bgColorClass="bg-teal-100 dark:bg-teal-500"
                  className="mr-4"
                />
              </InfoCard>
            </div>
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
                Đang xem: {months.find(m => m.value === selectedMonth)?.label} / {selectedYear}
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 mb-8">
            <div className="w-full">
              <ChartCard title={`Doanh thu theo ngày - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}>
                <Line data={revenueChartData} options={revenueChartOptions} />
                <ChartLegend legends={revenueChartLegends} />
              </ChartCard>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Dashboard;