import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Target,
  BarChart3,
  Settings,
} from "lucide-react";

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    segment: "",
    isActive: "",
    minSpent: "",
    maxSpent: "",
    minVisits: "",
    maxVisits: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    averageSpent: 0,
    totalRevenue: 0,
    segments: [],
  });

  // Mock data
  const mockCustomers = [
    {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      totalSpent: 12500,
      visitCount: 25,
      segment: "high-value",
      isActive: true,
      lastVisit: "2024-01-15T10:30:00Z",
      createdAt: "2023-06-01T09:00:00Z",
      preferences: { newsletter: true, sms: false },
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      totalSpent: 7500,
      visitCount: 18,
      segment: "regular",
      isActive: true,
      lastVisit: "2024-01-12T14:20:00Z",
      createdAt: "2023-07-15T11:30:00Z",
      preferences: { newsletter: true, sms: true },
    },
    {
      _id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1234567892",
      totalSpent: 2200,
      visitCount: 8,
      segment: "regular",
      isActive: true,
      lastVisit: "2024-01-08T16:45:00Z",
      createdAt: "2023-08-20T13:15:00Z",
      preferences: { newsletter: false, sms: false },
    },
    {
      _id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "+1234567893",
      totalSpent: 450,
      visitCount: 3,
      segment: "inactive",
      isActive: false,
      lastVisit: "2023-11-01T12:00:00Z",
      createdAt: "2023-09-10T10:00:00Z",
      preferences: { newsletter: true, sms: false },
    },
  ];

  const mockStats = {
    totalCustomers: 4,
    activeCustomers: 3,
    averageSpent: 5662.5,
    totalRevenue: 22650,
    segments: [
      { _id: "high-value", count: 1, totalSpent: 12500, averageSpent: 12500 },
      { _id: "regular", count: 2, totalSpent: 9700, averageSpent: 4850 },
      { _id: "inactive", count: 1, totalSpent: 450, averageSpent: 450 },
    ],
  };

  useEffect(() => {
    setCustomers(mockCustomers);
    setStats(mockStats);
    setPagination((prev) => ({
      ...prev,
      totalCount: mockCustomers.length,
      totalPages: Math.ceil(mockCustomers.length / prev.limit),
    }));
  }, []);

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "high-value":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "regular":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openModal = (type, customer = null) => {
    setModalType(type);
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setModalType("");
  };

  const CustomerForm = () => {
    const [formData, setFormData] = useState(
      selectedCustomer || {
        name: "",
        email: "",
        phone: "",
        totalSpent: 0,
        visitCount: 0,
        preferences: { newsletter: false, sms: false },
      }
    );

    const handleSubmit = (e) => {
      e.preventDefault();
      // API call logic here
      console.log("Submitting customer:", formData);
      closeModal();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {selectedCustomer ? "Edit Customer" : "Add New Customer"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Spent
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalSpent || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalSpent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.newsletter || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...(formData.preferences || {}),
                              newsletter: e.target.checked,
                            },
                          })
                        }
                        className="mr-2"
                      />
                      Email Newsletter
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.sms || false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferences: {
                              ...(formData.preferences || {}),
                              sms: e.target.checked,
                            },
                          })
                        }
                        className="mr-2"
                      />
                      SMS Notifications
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {selectedCustomer ? "Update Customer" : "Create Customer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const CustomerDetailsModal = () => {
    if (!selectedCustomer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Customer Details</h2>
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>×
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="font-medium flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedCustomer.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone</span>
                    <p className="font-medium flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Customer Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Segment</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSegmentColor(
                          selectedCustomer.segment
                        )}`}
                      >
                        {selectedCustomer.segment}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Spent</span>
                    <p className="font-medium text-green-600">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Visit Count</span>
                    <p className="font-medium">
                      {selectedCustomer.visitCount} visits
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="flex items-center mt-1">
                      {selectedCustomer.isActive ? (
                        <>
                          <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Last Visit</span>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(selectedCustomer.lastVisit)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Customer Since</span>
                  <p className="font-medium">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => openModal("edit", selectedCustomer)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Management
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openModal("bulk")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </button>
              <button
                onClick={() => openModal("create")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Customers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filters.segment}
                  onChange={(e) =>
                    setFilters({ ...filters, segment: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Segments</option>
                  <option value="high-value">High Value</option>
                  <option value="regular">Regular</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={filters.isActive}
                  onChange={(e) =>
                    setFilters({ ...filters, isActive: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSegmentColor(
                          customer.segment
                        )}`}
                      >
                        {customer.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.visitCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(customer.lastVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.isActive ? (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-sm text-green-600">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                            <span className="text-sm text-red-600">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openModal("view", customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", customer)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("delete", customer)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} customers
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
                {pagination.currentPage}
              </span>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (modalType === "create" || modalType === "edit") && (
        <CustomerForm />
      )}
      {showModal && modalType === "view" && <CustomerDetailsModal />}
    </div>
  );
};

export default CustomerManagementPage;
