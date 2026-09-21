"use client";

import { useState } from "react";

import HierarchyToolbar from "./components/HierarchyToolbar";
import UserHierarchy from "./components/UserHierarchy";
import "./style/hierarchy.css";

type TabType = "employees" | "departments" | "jobRoles";

type ShowOptions = {
  directReporting: boolean;
  hrReporting: boolean;
  jobRoleHierarchy: boolean;
  vacantPositions: boolean;
};

export default function Home() {
  const [activeTab, setActiveTab] =
    useState<TabType>("departments");

  const [viewType, setViewType] =
    useState("direct");

  const [showOptions, setShowOptions] =
    useState<ShowOptions>({
      directReporting: true,
      hrReporting: true,
      jobRoleHierarchy: true,
      vacantPositions: true,
    });

  const handleToggle = (
    key: keyof ShowOptions
  ) => {
    setShowOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main className="hierarchy-page">
      <div className="hierarchy-wrapper">
        <HierarchyToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewType={viewType}
          setViewType={setViewType}
          showOptions={showOptions}
          onToggle={handleToggle}
        />

        <UserHierarchy
          showOptions={showOptions}
        />
      </div>
    </main>
  );
}