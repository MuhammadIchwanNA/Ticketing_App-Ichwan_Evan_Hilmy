import React, { useState } from "react";
import {Calendar, DollarSign, BarChart3} from "lucide-react";
import { OverviewContent } from "./OverviewContent";
import { EventsContent } from "./EventContent";
import { TransactionsContent } from "./TransactionContent";

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "events" | "transactions" 
  >("overview");

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "events", name: "Events", icon: Calendar },
    { id: "transactions", name: "Transactions", icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Organizer Dashboard
          </h1>
          <p className="">Manage your events and track your success</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div>
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-sky text-ink"
                        : "border-transparent hover:text-ink hover:border-mint"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && <OverviewContent />}
          {activeTab === "events" && <EventsContent />}
          {activeTab === "transactions" && <TransactionsContent />}
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;
