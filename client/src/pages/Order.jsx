import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Calendar,
  DollarSign,
  Package,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view', 'bulk', 'stats'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orderStats, setOrderStats] = useState(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    customerId: '',
    orderValue: '',
    orderDate: '',
    status: 'pending',
    items: []
  });

  // Filter state
  const [filters, setFilters] = useState({
    minValue: '',
    maxValue: '',
    startDate: '',
    endDate: '',
    sortBy: 'orderDate',
    sortOrder: 'desc'
  });

  // Mock data for demonstration
  const mockOrders = [
    {
      _id: '1',
      customerId: { _id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
      orderValue: 299.99,
      orderDate: '2024-01-15T10:30:00Z',
      status: 'completed',
      items: [
        { productId: 'p1', productName: 'Laptop', quantity: 1, price: 299.99 }
      ]
    },
    {
      _id: '2',
      customerId: { _id: 'c2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891' },
      orderValue: 159.50,
      orderDate: '2024-01-14T14:20:00Z',
      status: 'pending',
      items: [
        { productId: 'p2', productName: 'Headphones', quantity: 2, price: 79.75 }
      ]
    },
    {
      _id: '3',
      customerId: { _id: 'c3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892' },
      orderValue: 89.99,
      orderDate: '2024-01-13T09:15:00Z',
      status: 'cancelled',
      items: [
        { productId: 'p3', productName: 'Mouse', quantity: 1, price: 89.99 }
      ]
    }
  ];

  const mockStats = {
    overview: {
      totalOrders: 150,
      totalValue: 25430.50,
      averageOrderValue: 169.54,
      completedOrders: 120,
      pendingOrders: 25,
      cancelledOrders: 5
    },
    monthlyTrends: [
      { _id: { year: 2024, month: 1 }, orderCount: 45, totalValue: 7500 },
      { _id: { year: 2023, month: 12 }, orderCount: 38, totalValue: 6200 }
    ]
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, filterStatus, filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        let filteredOrders = [...mockOrders];
        
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(order => 
            order.customerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (filterStatus) {
          filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
        }
        
        setOrders(filteredOrders);
        setTotalPages(Math.ceil(filteredOrders.length / 10));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setOrderStats(mockStats);
      }, 300);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateOrder = () => {
    setFormData({
      customerId: '',
      orderValue: '',
      orderDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: []
    });
    setModalType('create');
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      customerId: order.customerId._id,
      orderValue: order.orderValue,
      orderDate: order.orderDate.split('T')[0],
      status: order.status,
      items: order.items || []
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        // Simulate API call
        setTimeout(() => {
          setOrders(orders.filter(order => order._id !== orderId));
        }, 300);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      // Simulate API call
      setTimeout(() => {
        if (modalType === 'create') {
          const newOrder = {
            _id: Date.now().toString(),
            ...formData,
            customerId: { _id: formData.customerId, name: 'New Customer', email: 'new@example.com' },
            orderDate: new Date(formData.orderDate).toISOString()
          };
          setOrders([newOrder, ...orders]);
        } else if (modalType === 'edit') {
          setOrders(orders.map(order => 
            order._id === selectedOrder._id 
              ? { ...order, ...formData, orderDate: new Date(formData.orderDate).toISOString() }
              : order
          ));
        }
        setShowModal(false);
        setSelectedOrder(null);
      }, 300);
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleShowStats = () => {
    loadOrderStats();
    setModalType('stats');
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              Order Management
            </h1>
            <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShowStats}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
            <button
              onClick={() => {setModalType('bulk'); setShowModal(true);}}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </button>
            <button
              onClick={handleCreateOrder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="number"
                value={filters.minValue}
                onChange={(e) => setFilters({...filters, minValue: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="number"
                value={filters.maxValue}
                onChange={(e) => setFilters({...filters, maxValue: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-600">#{order._id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.customerId.name}</div>
                        <div className="text-sm text-gray-500">{order.customerId.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">${order.orderValue.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{order.items?.length || 0} items</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit Order"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalType === 'create' && 'Create New Order'}
                {modalType === 'edit' && 'Edit Order'}
                {modalType === 'view' && 'Order Details'}
                {modalType === 'bulk' && 'Bulk Import Orders'}
                {modalType === 'stats' && 'Order Statistics'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer ID
                      </label>
                      <input
                        type="text"
                        value={formData.customerId}
                        onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Value
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.orderValue}
                        onChange={(e) => setFormData({...formData, orderValue: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Date
                      </label>
                      <input
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {modalType === 'create' ? 'Create Order' : 'Update Order'}
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'view' && selectedOrder && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedOrder.customerId.name}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.customerId.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedOrder.customerId.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order Information
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Order ID:</span> #{selectedOrder._id}</p>
                        <p><span className="font-medium">Value:</span> ${selectedOrder.orderValue.toFixed(2)}</p>
                        <p><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          {getStatusIcon(selectedOrder.status)}
                          <span className={getStatusBadge(selectedOrder.status)}>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-2 px-4 font-medium text-gray-700">Product</th>
                              <th className="text-left py-2 px-4 font-medium text-gray-700">Quantity</th>
                              <th className="text-left py-2 px-4 font-medium text-gray-700">Price</th>
                              <th className="text-right py-2 px-4 font-medium text-gray-700">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item, index) => (
                              <tr key={index} className="border-t">
                                <td className="py-2 px-4">{item.productName}</td>
                                <td className="py-2 px-4">{item.quantity}</td>
                                <td className="py-2 px-4">${item.price.toFixed(2)}</td>
                                <td className="py-2 px-4 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'bulk' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">Upload CSV file with order data</p>
                    <p className="text-sm text-gray-500 mb-4">Required columns: customerId, orderValue, orderDate</p>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      id="bulk-upload"
                    />
                    <label
                      htmlFor="bulk-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Import Orders
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'stats' && orderStats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                          <p className="text-2xl font-bold text-blue-900">{orderStats.overview.totalOrders}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Total Value</p>
                          <p className="text-2xl font-bold text-green-900">${orderStats.overview.totalValue.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Average Order</p>
                          <p className="text-2xl font-bold text-purple-900">${orderStats.overview.averageOrderValue.toFixed(2)}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Completion Rate</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {Math.round((orderStats.overview.completedOrders / orderStats.overview.totalOrders) * 100)}%
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-600 font-medium">Completed</p>
                      <p className="text-xl font-bold text-green-900">{orderStats.overview.completedOrders}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm text-yellow-600 font-medium">Pending</p>
                      <p className="text-xl font-bold text-yellow-900">{orderStats.overview.pendingOrders}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-red-600 font-medium">Cancelled</p>
                      <p className="text-xl font-bold text-red-900">{orderStats.overview.cancelledOrders}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-4 font-medium text-gray-700">Month</th>
                            <th className="text-right py-2 px-4 font-medium text-gray-700">Orders</th>
                            <th className="text-right py-2 px-4 font-medium text-gray-700">Total Value</th>
                            <th className="text-right py-2 px-4 font-medium text-gray-700">Avg. Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderStats.monthlyTrends.map((trend, index) => (
                            <tr key={index} className="border-t">
                              <td className="py-2 px-4">
                                {new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long' 
                                })}
                              </td>
                              <td className="py-2 px-4 text-right">{trend.orderCount}</td>
                              <td className="py-2 px-4 text-right">${trend.totalValue.toFixed(2)}</td>
                              <td className="py-2 px-4 text-right">${(trend.totalValue / trend.orderCount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;