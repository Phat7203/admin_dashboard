import React, { useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Eye, ShoppingCart, Heart, Package } from 'lucide-react';

const ProductAnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data cho sản phẩm
  const mockProducts = [
    {
      _id: '60d5ecb74b24c72b3c8e4e5a',
      productName: 'iPhone 15 Pro Max',
      basePrice: 29990000,
      discountPrice: 27990000,
      categoryId: 'electronics',
      productImages: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'RAM', value: '8GB' },
        { name: 'Storage', value: '256GB' }
      ],
      rating: 4.8,
      soldQuantity: 1250,
      viewCount: 15420,
      wishlistCount: 890
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e5b',
      productName: 'Samsung Galaxy S24 Ultra',
      basePrice: 26990000,
      discountPrice: 24990000,
      categoryId: 'electronics',
      productImages: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'RAM', value: '12GB' },
        { name: 'Storage', value: '512GB' }
      ],
      rating: 4.7,
      soldQuantity: 980,
      viewCount: 12340,
      wishlistCount: 670
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e5c',
      productName: 'MacBook Pro M3 14 inch',
      basePrice: 52990000,
      discountPrice: 49990000,
      categoryId: 'electronics',
      productImages: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Chip', value: 'Apple M3' },
        { name: 'RAM', value: '16GB' }
      ],
      rating: 4.9,
      soldQuantity: 650,
      viewCount: 8900,
      wishlistCount: 1200
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e5d',
      productName: 'Dell XPS 13 Plus',
      basePrice: 35990000,
      discountPrice: 32990000,
      categoryId: 'electronics',
      productImages: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'CPU', value: 'Intel i7' },
        { name: 'RAM', value: '16GB' }
      ],
      rating: 4.5,
      soldQuantity: 420,
      viewCount: 6780,
      wishlistCount: 340
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e5e',
      productName: 'iPad Pro 12.9 inch M2',
      basePrice: 28990000,
      discountPrice: 26990000,
      categoryId: 'electronics',
      productImages: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Chip', value: 'Apple M2' },
        { name: 'Storage', value: '256GB' }
      ],
      rating: 4.6,
      soldQuantity: 780,
      viewCount: 9850,
      wishlistCount: 560
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e5f',
      productName: 'Sony WH-1000XM5',
      basePrice: 8990000,
      discountPrice: 7990000,
      categoryId: 'audio',
      productImages: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Type', value: 'Wireless' },
        { name: 'Battery', value: '30 hours' }
      ],
      rating: 4.8,
      soldQuantity: 1580,
      viewCount: 18900,
      wishlistCount: 920
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e60',
      productName: 'Apple Watch Series 9',
      basePrice: 9990000,
      discountPrice: 8990000,
      categoryId: 'wearables',
      productImages: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Size', value: '45mm' },
        { name: 'Battery', value: '18 hours' }
      ],
      rating: 4.7,
      soldQuantity: 1120,
      viewCount: 14600,
      wishlistCount: 780
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e61',
      productName: 'Nintendo Switch OLED',
      basePrice: 8990000,
      discountPrice: 8490000,
      categoryId: 'gaming',
      productImages: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Screen', value: '7 inch OLED' },
        { name: 'Storage', value: '64GB' }
      ],
      rating: 4.6,
      soldQuantity: 950,
      viewCount: 11200,
      wishlistCount: 650
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e62',
      productName: 'Dyson V15 Detect',
      basePrice: 18990000,
      discountPrice: 16990000,
      categoryId: 'home',
      productImages: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Type', value: 'Cordless' },
        { name: 'Battery', value: '60 minutes' }
      ],
      rating: 4.4,
      soldQuantity: 380,
      viewCount: 5600,
      wishlistCount: 290
    },
    {
      _id: '60d5ecb74b24c72b3c8e4e63',
      productName: 'Xiaomi Mi Air Purifier 4',
      basePrice: 4990000,
      discountPrice: 4490000,
      categoryId: 'home',
      productImages: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=150&h=150&fit=crop'],
      generalAttributes: [
        { name: 'Coverage', value: '48m²' },
        { name: 'CADR', value: '400m³/h' }
      ],
      rating: 4.3,
      soldQuantity: 720,
      viewCount: 8400,
      wishlistCount: 410
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Chart data
  const lineChartData = {
    labels: ['20/06', '21/06', '22/06', '23/06', '24/06', '25/06', '26/06'],
    datasets: [
      {
        label: 'Tổng hoạt động',
        data: [120, 145, 132, 168, 155, 189, 204],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Tỷ lệ tăng trưởng (%)',
        data: [15.2, 20.8, -9.0, 27.3, -7.7, 21.9, 7.9],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y-axis-2',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'top',
    },
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          id: 'y-axis-1',
          scaleLabel: {
            display: true,
            labelString: 'Tổng hoạt động'
          }
        },
        {
          type: 'linear',
          display: true,
          position: 'right',
          id: 'y-axis-2',
          gridLines: {
            drawOnChartArea: false,
          },
          scaleLabel: {
            display: true,
            labelString: 'Tỷ lệ tăng trưởng (%)'
          }
        },
      ],
    },
  };

  const pieChartData = {
    labels: ['Electronics', 'Audio', 'Wearables', 'Gaming', 'Home'],
    datasets: [
      {
        data: [5, 1, 1, 1, 2],
        backgroundColor: [
          '#8884d8',
          '#82ca9d',
          '#ffc658',
          '#ff7300',
          '#8dd1e1'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'bottom',
    },
  };

  const barChartData = {
    labels: ['iPhone 15 Pro Max', 'Samsung Galaxy S24', 'MacBook Pro M3', 'Dell XPS 13', 'iPad Pro 12.9'],
    datasets: [
      {
        label: 'Hoạt động hiện tại',
        data: [150, 130, 110, 90, 70],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Hoạt động trước đó',
        data: [100, 85, 70, 55, 40],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'top',
    },
    scales: {
      xAxes: [{
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }]
    }
  };

  const topGrowingProducts = [
    {
      productId: mockProducts[0]._id,
      product: mockProducts[0],
      currentCount: 150,
      previousCount: 100,
      growthRate: 50
    },
    {
      productId: mockProducts[1]._id,
      product: mockProducts[1],
      currentCount: 130,
      previousCount: 85,
      growthRate: 60
    },
    {
      productId: mockProducts[2]._id,
      product: mockProducts[2],
      currentCount: 110,
      previousCount: 70,
      growthRate: 70
    },
    {
      productId: mockProducts[3]._id,
      product: mockProducts[3],
      currentCount: 90,
      previousCount: 55,
      growthRate: 80
    },
    {
      productId: mockProducts[4]._id,
      product: mockProducts[4],
      currentCount: 70,
      previousCount: 40,
      growthRate: 90
    }
  ];

  const totalViews = mockProducts.reduce((sum, p) => sum + p.viewCount, 0);
  const totalSold = mockProducts.reduce((sum, p) => sum + p.soldQuantity, 0);
  const totalWishlist = mockProducts.reduce((sum, p) => sum + p.wishlistCount, 0);

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'growth', label: 'Tăng trưởng' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'top-growing', label: 'Top tăng trưởng' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Analytics Dashboard</h1>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khoảng thời gian
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sản phẩm
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="all">Tất cả sản phẩm</option>
                {mockProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.productName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-gray-900">{mockProducts.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(totalViews)}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng đã bán</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(totalSold)}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng wishlist</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(totalWishlist)}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo danh mục</h3>
              <div className="h-80">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Growth Tab */}
        {activeTab === 'growth' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Biểu đồ tăng trưởng hoạt động ({selectedPeriod})
              </h3>
              <div className="h-80">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </div>

            {/* Growth Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tăng trưởng trung bình</p>
                    <p className="text-2xl font-bold text-green-600">+12.4%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ngày tăng trưởng cao nhất</p>
                    <p className="text-2xl font-bold text-blue-600">+27.3%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng hoạt động 7 ngày</p>
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(1113)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách sản phẩm</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wishlist
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.productImages[0]}
                            alt={product.productName}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.generalAttributes.slice(0, 2).map(attr => attr.value).join(' • ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(product.discountPrice)}
                        </div>
                        {product.basePrice !== product.discountPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.basePrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {product.rating}
                          </span>
                          <div className="ml-1 text-yellow-400">★</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(product.viewCount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(product.soldQuantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(product.wishlistCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Growing Tab */}
        {activeTab === 'top-growing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top 5 sản phẩm tăng trưởng nhanh nhất
              </h3>
              <div className="h-80">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Top Growing Products List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết tăng trưởng</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {topGrowingProducts.map((item, index) => (
                  <div key={item.productId} className="p-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <img
                        className="ml-4 h-12 w-12 rounded-lg object-cover"
                        src={item.product.productImages[0]}
                        alt={item.product.productName}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.product.discountPrice)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatNumber(item.currentCount)}
                        </div>
                        <div className="text-xs text-gray-500">Hiện tại</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatNumber(item.previousCount)}
                        </div>
                        <div className="text-xs text-gray-500">Trước đó</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-sm font-medium ${item.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growthRate >= 0 ? '+' : ''}{item.growthRate}%
                        </div>
                        <div className="text-xs text-gray-500">Tăng trưởng</div>
                      </div>
                      
                      <div className="flex items-center">
                        {item.growthRate >= 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAnalyticsDashboard;