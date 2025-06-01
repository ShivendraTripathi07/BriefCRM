import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Mail,
  Activity,
  Calendar,
  DollarSign,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCampaigns: 0,
    avgOrderValue: 0,
    deliveryRate: 0,
  });

  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {};
  // const fetchDashboardData = async () => {
  //   try {
  //     // Fetch stats from your APIs
  //     const [ordersResponse, campaignsResponse] = await Promise.all([
  //       fetch("/api/orders/stats", {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }),
  //       fetch("/api/campaigns/history?limit=5", {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       }),
  //     ]);

  //     const ordersData = await ordersResponse.json();
  //     const campaignsData = await campaignsResponse.json();

  //     if (ordersData.success) {
  //       setStats((prev) => ({
  //         ...prev,
  //         totalOrders: ordersData.data.overview.totalOrders,
  //         totalRevenue: ordersData.data.overview.totalValue,
  //         avgOrderValue: ordersData.data.overview.averageOrderValue,
  //       }));
  //     }

  //     if (campaignsData.success) {
  //       setRecentCampaigns(campaignsData.data);
  //       setStats((prev) => ({
  //         ...prev,
  //         activeCampaigns: campaignsData.data.length,
  //         deliveryRate:
  //           campaignsData.data.reduce(
  //             (acc, camp) => acc + parseFloat(camp.deliveryRate),
  //             0
  //           ) / campaignsData.data.length,
  //       }));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching dashboard data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm mt-2 flex items-center ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back! Here's your CRM overview.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/campaign"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Target className="w-4 h-4 mr-2" />
                Create Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            change={8.2}
            color="blue"
          />
          <StatCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change={12.5}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            change={-2.4}
            color="purple"
          />
          <StatCard
            icon={Mail}
            title="Active Campaigns"
            value={stats.activeCampaigns}
            change={5.1}
            color="orange"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={Activity}
            title="Avg Order Value"
            value={`₹${stats.avgOrderValue.toFixed(2)}`}
            change={3.2}
            color="indigo"
          />
          <StatCard
            icon={Target}
            title="Delivery Rate"
            value={`${stats.deliveryRate.toFixed(1)}%`}
            change={1.8}
            color="emerald"
          />
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Campaigns
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.map((campaign, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {campaign.campaignName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {campaign.audienceSize} recipients •{" "}
                          {campaign.deliveryRate}% delivered
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {campaign.delivered}/{campaign.audienceSize}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(campaign.lastSentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first campaign to engage with customers
                </p>
                <Link
                  to="/campaign"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Manage Customers</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View and manage your customer database
            </p>
            <Link
              to="/customer"
              className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Customers
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Order Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Analyze order patterns and trends
            </p>
            <Link
              to="/order"
              className="w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              View Orders
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Campaign Builder</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create targeted marketing campaigns
            </p>
            <Link
              to="/campaign"
              className="w-full bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Build Campaign
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
