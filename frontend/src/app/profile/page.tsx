"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UsageLog {
  id: number;
  type: string;
  count: number;
  created_at: string;
}

export default function Profile() {
  const [userEmail, setUserEmail] = useState("");
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usageHistory, setUsageHistory] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    // In a real app, you'd fetch user data and usage history from the backend
    // For demo purposes, we'll use mock data
    setUserEmail("user@example.com");
    setCurrentPlan("free");
    setUsageHistory([
      {
        id: 1,
        type: "repurpose",
        count: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        type: "repurpose",
        count: 1,
        created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
      }
    ]);
    setLoading(false);
  }, [router]);

  const getPlanLimits = (plan: string) => {
    if (plan === "free") {
      return { daily: 2, monthly: 60 };
    }
    return { daily: -1, monthly: -1 }; // Unlimited
  };

  const getUsageToday = () => {
    const today = new Date().toDateString();
    return usageHistory
      .filter(log => new Date(log.created_at).toDateString() === today)
      .reduce((total, log) => total + log.count, 0);
  };

  const getUsageThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return usageHistory
      .filter(log => new Date(log.created_at) >= startOfMonth)
      .reduce((total, log) => total + log.count, 0);
  };

  const planLimits = getPlanLimits(currentPlan);
  const usageToday = getUsageToday();
  const usageThisMonth = getUsageThisMonth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Repurposely
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
              <Link href="/billing" className="text-gray-700 hover:text-indigo-600">
                Billing
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("user_id");
                  localStorage.removeItem("access_token");
                  router.push("/auth/login");
                }}
                className="text-gray-700 hover:text-indigo-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account and view usage statistics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{userEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Plan</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{currentPlan} Plan</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    href="/billing"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors block text-center"
                  >
                    Manage Subscription
                  </Link>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Usage Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Usage Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">{usageToday}</div>
                      <div className="text-sm text-gray-600 mb-1">Used Today</div>
                      <div className="text-xs text-gray-500">
                        {planLimits.daily === -1 ? "Unlimited" : `Limit: ${planLimits.daily}`}
                      </div>
                      {planLimits.daily !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.min((usageToday / planLimits.daily) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">{usageThisMonth}</div>
                      <div className="text-sm text-gray-600 mb-1">Used This Month</div>
                      <div className="text-xs text-gray-500">
                        {planLimits.monthly === -1 ? "Unlimited" : `Limit: ${planLimits.monthly}`}
                      </div>
                      {planLimits.monthly !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-gray-300 h-2 rounded-full"
                            style={{ width: `${Math.min((usageThisMonth / planLimits.monthly) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage History */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  {usageHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2">No activity yet</p>
                      <p className="text-sm">Start repurposing content to see your activity here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {usageHistory.map((log) => (
                        <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {log.type} Action
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              +{log.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Change Password
                      </label>
                      <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                        Change Password
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Export Data
                      </label>
                      <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                        Download My Data
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
