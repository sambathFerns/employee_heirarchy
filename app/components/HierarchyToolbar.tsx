"use client";

type TabType = "employees" | "departments" | "jobRoles";

type ShowOptions = {
  directReporting: boolean;
  hrReporting: boolean;
  jobRoleHierarchy: boolean;
  vacantPositions: boolean;
};

type HierarchyToolbarProps = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  viewType: string;
  setViewType: (value: string) => void;

  showOptions: ShowOptions;
  onToggle: (key: keyof ShowOptions) => void;
};

export default function HierarchyToolbar({
  activeTab,
  setActiveTab,
  viewType,
  setViewType,
  showOptions,
  onToggle,
}: HierarchyToolbarProps) {
  return (
    <div className="hierarchy-toolbar">
      <div className="hierarchy-tabs">
        <button
          className={`hierarchy-tab ${
            activeTab === "employees" ? "active" : ""
          }`}
          onClick={() => setActiveTab("employees")}
        >
          Employees
        </button>

        <button
          className={`hierarchy-tab ${
            activeTab === "departments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("departments")}
        >
          Departments
        </button>

        <button
          className={`hierarchy-tab ${
            activeTab === "jobRoles" ? "active" : ""
          }`}
          onClick={() => setActiveTab("jobRoles")}
        >
          Job Roles (JD)
        </button>
      </div>

      <div className="hierarchy-controls">
        <div className="view-type-section">
          <label>View type</label>

          <select
            value={viewType}
            onChange={(event) =>
              setViewType(event.target.value)
            }
          >
            <option value="organization">
              Organization (Combined)
            </option>

            <option value="direct">
              Direct Reporting
            </option>

            <option value="hr">
              HR Reporting
            </option>

            <option value="jobRole">
              Job Role Hierarchy
            </option>
          </select>
        </div>

        <div className="show-section">
          <span className="show-label">Show</span>

          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showOptions.directReporting}
              onChange={() =>
                onToggle("directReporting")
              }
            />
            <span>Direct reporting</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showOptions.hrReporting}
              onChange={() =>
                onToggle("hrReporting")
              }
            />
            <span>HR reporting</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showOptions.jobRoleHierarchy}
              onChange={() =>
                onToggle("jobRoleHierarchy")
              }
            />
            <span>Job role hierarchy</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showOptions.vacantPositions}
              onChange={() =>
                onToggle("vacantPositions")
              }
            />
            <span>Vacant positions</span>
          </label>
        </div>
      </div>
    </div>
  );
}