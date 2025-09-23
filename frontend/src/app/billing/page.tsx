"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPlan, setCurrentPlan] = useState("free");
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    // In a real app, you'd fetch the user's current plan from the backend
    // For now, we'll just show the UI
    setCurrentPlan("free");
  }, [router]);

  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    setError("");

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("Please log in first");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          plan_type: plan,
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/billing`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to create checkout session");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      period: "/month",
      features: [
        "2 repurposing actions/day",
        "Basic platform support",
        "Standard tones",
        "Community support"
      ],
      current: currentPlan === "free"
    },
    {
      id: "monthly",
      name: "Monthly",
      price: "₹799",
      period: "/month",
      features: [
        "Unlimited repurposing",
        "All platforms",
        "Advanced tones",
        "Priority support",
        "API access"
      ],
      popular: true,
      current: currentPlan === "paid"
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "₹8,499",
      period: "/year",
      features: [
        "Everything in Monthly",
        "22% savings",
        "Custom integrations",
        "Advanced analytics",
        "Dedicated support"
      ],
      current: currentPlan === "paid"
    },
    {
      id: "payg",
      name: "Pay-as-you-go",
      price: "₹99",
      period: "/10 credits",
      features: [
        "10 repurposing credits",
        "All platforms",
        "Advanced tones",
        "One-time purchase",
        "No recurring charges"
      ],
      current: false
    }
  ];

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
              <Link href="/profile" className="text-gray-700 hover:text-indigo-600">
                Profile
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your subscription and billing information</p>
          </div>

          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {currentPlan === "free" ? "Free Plan" : "Paid Plan"}
                </p>
                <p className="text-gray-600">
                  {currentPlan === "free"
                    ? "2 repurposing actions per day"
                    : "Unlimited repurposing actions"
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {currentPlan === "free" ? "₹0" : "₹799"}
                  <span className="text-lg font-normal text-gray-600">
                    {currentPlan === "free" ? "/month" : "/month"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-md p-8 ${
                  plan.popular ? "border-2 border-indigo-500 relative" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">{plan.period}</span>
                  </div>
                  {plan.id === "yearly" && (
                    <div className="text-sm text-green-600 font-semibold">Save 22%</div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.current ? (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    } disabled:opacity-50`}
                  >
                    {loading ? "Processing..." : plan.id === "free" ? "Downgrade" : "Upgrade"}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Billing History */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Billing History</h2>
            <div className="text-center text-gray-500 py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2">No billing history yet</p>
              <p className="text-sm">Your payment history will appear here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
