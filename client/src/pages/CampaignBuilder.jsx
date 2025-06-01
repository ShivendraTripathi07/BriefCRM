import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Send,
  Users,
  MessageCircle,
  Filter,
  ChevronDown,
  Sparkles,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CampaignBuilder = () => {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [audienceRules, setAudienceRules] = useState([
    { field: "", operator: "", value: "", logicalOperator: "AND" },
  ]);
  const [audienceSize, setAudienceSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);

  const fieldOptions = [
    { value: "totalSpent", label: "Total Spent", type: "number" },
    { value: "orderCount", label: "Order Count", type: "number" },
    { value: "avgOrderValue", label: "Average Order Value", type: "number" },
    {
      value: "daysSinceLastOrder",
      label: "Days Since Last Order",
      type: "number",
    },
    { value: "status", label: "Customer Status", type: "text" },
    { value: "city", label: "City", type: "text" },
    { value: "createdAt", label: "Registration Date", type: "date" },
  ];

  const operatorOptions = [
    { value: "gt", label: "Greater than (>)" },
    { value: "gte", label: "Greater than or equal (>=)" },
    { value: "lt", label: "Less than (<)" },
    { value: "lte", label: "Less than or equal (<=)" },
    { value: "eq", label: "Equal to (=)" },
    { value: "ne", label: "Not equal to (!=)" },
  ];

  const addRule = () => {
    setAudienceRules([
      ...audienceRules,
      { field: "", operator: "", value: "", logicalOperator: "AND" },
    ]);
  };

  const removeRule = (index) => {
    if (audienceRules.length > 1) {
      const newRules = audienceRules.filter((_, i) => i !== index);
      setAudienceRules(newRules);
    }
  };

  const updateRule = (index, field, value) => {
    const newRules = [...audienceRules];
    newRules[index][field] = value;
    setAudienceRules(newRules);
  };

  const previewAudience = async () => {
    if (
      audienceRules.some((rule) => !rule.field || !rule.operator || !rule.value)
    ) {
      alert("Please fill in all rule fields before previewing");
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await fetch("/api/campaigns/audience/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ audienceRules }),
      });

      const data = await response.json();
      if (data.success) {
        setAudienceSize(data.data.audienceSize);
      } else {
        alert("Error previewing audience: " + data.message);
      }
    } catch (error) {
      console.error("Error previewing audience:", error);
      alert("Error previewing audience");
    } finally {
      setPreviewLoading(false);
    }
  };

  const generateAIMessage = async () => {
    const prompt = `Generate a personalized marketing message for customers who ${audienceRules
      .map((rule) => `${rule.field} ${rule.operator} ${rule.value}`)
      .join(
        " and "
      )}. Keep it under 100 characters and include {name} placeholder.`;

    // This would integrate with your AI service
    const suggestions = [
      "Hi {name}, we miss you! Here's 20% off your next purchase. Shop now!",
      "Hey {name}, exclusive offer just for you - 15% discount on premium items!",
      "{name}, your loyalty deserves rewards! Enjoy free shipping on your next order.",
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleAIMessageSuggestion = async () => {
    setLoading(true);
    try {
      const suggestion = await generateAIMessage();
      setMessage(suggestion);
    } catch (error) {
      console.error("Error generating AI message:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (
      !campaignName ||
      !message ||
      audienceRules.some((rule) => !rule.field || !rule.operator || !rule.value)
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: campaignName,
          message,
          audienceRules,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(
          `Campaign created successfully! Targeting ${data.data.audienceSize} customers.`
        );
        navigate("/campaigns/history");
      } else {
        alert("Error creating campaign: " + data.message);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Error creating campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Campaign Builder
                </h1>
                <p className="text-gray-600">
                  Create targeted marketing campaigns
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={previewAudience}
                disabled={previewLoading}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewLoading ? "Loading..." : "Preview Audience"}
              </button>
              <button
                onClick={createCampaign}
                disabled={loading || audienceSize === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Holiday Sale Campaign"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Message Template *
                    </label>
                    <button
                      onClick={handleAIMessageSuggestion}
                      className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      AI Suggest
                    </button>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hi {name}, here's a special offer just for you!"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {"{name}"} for personalization. {message.length}/160
                    characters
                  </p>
                </div>
              </div>
            </div>

            {/* Audience Rules */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Audience Rules
                </h2>
                <button
                  onClick={addRule}
                  className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rule
                </button>
              </div>

              <div className="space-y-4">
                {audienceRules.map((rule, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Rule {index + 1}
                      </span>
                      {audienceRules.length > 1 && (
                        <button
                          onClick={() => removeRule(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Field
                        </label>
                        <select
                          value={rule.field}
                          onChange={(e) =>
                            updateRule(index, "field", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select field</option>
                          {fieldOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Operator
                        </label>
                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            updateRule(index, "operator", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select operator</option>
                          {operatorOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Value
                        </label>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(index, "value", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter value"
                        />
                      </div>

                      {index < audienceRules.length - 1 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Logic
                          </label>
                          <select
                            value={rule.logicalOperator}
                            onChange={(e) =>
                              updateRule(
                                index,
                                "logicalOperator",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Audience Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Audience Preview
              </h3>

              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {audienceSize.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  customers will receive this campaign
                </p>
              </div>

              <button
                onClick={previewAudience}
                disabled={previewLoading}
                className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {previewLoading ? "Loading..." : "Refresh Preview"}
              </button>
            </div>

            {/* Message Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Message Preview
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    SMS Preview
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {message.replace("{name}", "John Doe") ||
                    "Your message will appear here..."}
                </p>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>• Messages are personalized with customer names</p>
                <p>• Keep messages under 160 characters for best delivery</p>
                <p>• Delivery typically takes 1-5 minutes</p>
              </div>
            </div>

            {/* Campaign Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">
                💡 Campaign Tips
              </h3>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Use specific targeting for better engagement</li>
                <li>• Test different message variations</li>
                <li>• Send campaigns at optimal times (10AM-2PM)</li>
                <li>• Include clear call-to-action</li>
                <li>• Monitor delivery rates and adjust</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilder;
