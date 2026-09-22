"use client";

import {
  Background,
  Controls,
  Handle,
  MiniMap,
  OnNodeDrag,
  Position,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "../style/hierarchy.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiExternalLink, FiEye, FiMove, FiX } from "react-icons/fi";

type UserStatus = "FILLED" | "VACANT" | "RECRUITING";

type HierarchyNode = {
  id: string;
  name: string;
  role: string;
  occupied: number;
  total: number;
  status: "FILLED" | "VACANT" | "RECRUITING";
  image?: string;

  employeeId?: string;
  department?: string;
  location?: string;
  workEmail?: string;
  phone?: string;
  dateOfJoining?: string;
  employmentType?: string;

  reportsTo?: string[];
};

type RelationshipType =
  | "DIRECT_REPORTING"
  | "HR_REPORTING"
  | "JOB_ROLE_HIERARCHY";

type HierarchyRelationship = {
  id: string;
  parentId: string;
  childId: string;
  relationshipType: RelationshipType;
};

type HierarchyResponse = {
  success: boolean;
  data: {
    nodes: HierarchyNode[];
    relationships: HierarchyRelationship[];
  };
};

type User = {
  id: string;
  name: string;
  role: string;
  occupied: number;
  total: number;
  status?: "filled" | "vacant" | "recruiting";
  image?: string;

  employeeId?: string;
  department?: string;
  location?: string;
  workEmail?: string;
  phone?: string;
  dateOfJoining?: string;
  employmentType?: string;

  reportsTo?: string[];

  hasChildren?: boolean;
  onViewProfile?: (user: User) => void;
};

type NodeData = User & {
  hasChildren: boolean;
  onViewProfile?: (user: User) => void;
};

type ShowOptions = {
  directReporting: boolean;
  hrReporting: boolean;
  jobRoleHierarchy: boolean;
  vacantPositions: boolean;
};

type UserHierarchyProps = {
  showOptions: ShowOptions;
};

type PositionMap = Record<string, { x: number; y: number }>;

/* =========================================================
   HIERARCHY JSON
========================================================= */
const hierarchyResponse: HierarchyResponse = {
  success: true,

  data: {
    nodes: [
      {
        id: "node-001",
        name: "Timothy Brand",
        role: "CEO",
        occupied: 1,
        total: 1,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=11",

        employeeId: "EMP00101",
        department: "Executive",
        location: "Bangalore",
        workEmail: "timothy.brand@acme.com",
        phone: "+91 98765 43201",
        dateOfJoining: "10 Jan 2018",
        employmentType: "Full Time",
      },

      {
        id: "node-002",
        name: "Alex Johnstone",
        role: "CTO",
        occupied: 3,
        total: 5,
        status: "RECRUITING",
        image: "https://i.pravatar.cc/100?img=12",

        employeeId: "EMP00102",
        department: "Engineering",
        location: "Bangalore",
        workEmail: "alex.johnstone@acme.com",
        phone: "+91 98765 43202",
        dateOfJoining: "15 Mar 2019",
        employmentType: "Full Time",
      },

      {
        id: "node-003",
        name: "Emily Watson",
        role: "HR Manager",
        occupied: 2,
        total: 2,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=47",

        employeeId: "EMP00103",
        department: "Human Resources",
        location: "Bangalore",
        workEmail: "emily.watson@acme.com",
        phone: "+91 98765 43203",
        dateOfJoining: "20 Jun 2019",
        employmentType: "Full Time",
      },

      {
        id: "node-004",
        name: "Sabrina White",
        role: "CRO",
        occupied: 2,
        total: 2,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=44",

        employeeId: "EMP00104",
        department: "Revenue",
        location: "Mumbai",
        workEmail: "sabrina.white@acme.com",
        phone: "+91 98765 43204",
        dateOfJoining: "05 Aug 2019",
        employmentType: "Full Time",
      },

      {
        id: "node-005",
        name: "Tommy Miller",
        role: "Lead Product Manager",
        occupied: 2,
        total: 3,
        status: "RECRUITING",
        image: "https://i.pravatar.cc/100?img=13",

        employeeId: "EMP00105",
        department: "Product",
        location: "Bangalore",
        workEmail: "tommy.miller@acme.com",
        phone: "+91 98765 43205",
        dateOfJoining: "12 Sep 2020",
        employmentType: "Full Time",
      },

      {
        id: "node-006",
        name: "William Scott",
        role: "QA Manager",
        occupied: 3,
        total: 3,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=14",

        employeeId: "EMP00106",
        department: "Quality Assurance",
        location: "Bangalore",
        workEmail: "william.scott@acme.com",
        phone: "+91 98765 43206",
        dateOfJoining: "18 Nov 2020",
        employmentType: "Full Time",
      },

      {
        id: "node-007",
        name: "Jack Wilson",
        role: "Frontend Developer",
        occupied: 1,
        total: 1,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=15",

        employeeId: "EMP00123",
        department: "Engineering",
        location: "Bangalore",
        workEmail: "jack.wilson@acme.com",
        phone: "+91 98765 43210",
        dateOfJoining: "12 Jan 2022",
        employmentType: "Full Time",
      },

      {
        id: "node-008",
        name: "Samuel Parker",
        role: "Backend Developer",
        occupied: 1,
        total: 1,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=16",

        employeeId: "EMP00124",
        department: "Engineering",
        location: "Bangalore",
        workEmail: "samuel.parker@acme.com",
        phone: "+91 98765 43211",
        dateOfJoining: "21 Feb 2022",
        employmentType: "Full Time",
      },

      {
        id: "node-009",
        name: "Chloe Morgan",
        role: "Recruiter",
        occupied: 2,
        total: 2,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=48",

        employeeId: "EMP00125",
        department: "Human Resources",
        location: "Bangalore",
        workEmail: "chloe.morgan@acme.com",
        phone: "+91 98765 43212",
        dateOfJoining: "14 Mar 2021",
        employmentType: "Full Time",
      },

      {
        id: "node-010",
        name: "Hannah Stevens",
        role: "HR Executive",
        occupied: 0,
        total: 1,
        status: "VACANT",
        image: "https://i.pravatar.cc/100?img=49",

        employeeId: "POSITION-HR-001",
        department: "Human Resources",
        location: "Bangalore",
        workEmail: "",
        phone: "",
        dateOfJoining: "",
        employmentType: "Full Time",
      },

      {
        id: "node-011",
        name: "Charles Lancaster",
        role: "Account Executive",
        occupied: 3,
        total: 4,
        status: "RECRUITING",
        image: "https://i.pravatar.cc/100?img=51",

        employeeId: "EMP00127",
        department: "Sales",
        location: "Mumbai",
        workEmail: "charles.lancaster@acme.com",
        phone: "+91 98765 43214",
        dateOfJoining: "08 Jul 2021",
        employmentType: "Full Time",
      },

      {
        id: "node-012",
        name: "Kimmi Chin",
        role: "CRM Administrator",
        occupied: 2,
        total: 2,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=17",

        employeeId: "EMP00128",
        department: "Sales Operations",
        location: "Bangalore",
        workEmail: "kimmi.chin@acme.com",
        phone: "+91 98765 43215",
        dateOfJoining: "19 Aug 2021",
        employmentType: "Full Time",
      },

      {
        id: "node-013",
        name: "Jessica Clarke",
        role: "Product Manager",
        occupied: 2,
        total: 2,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=45",

        employeeId: "EMP00129",
        department: "Product",
        location: "Bangalore",
        workEmail: "jessica.clarke@acme.com",
        phone: "+91 98765 43216",
        dateOfJoining: "11 Oct 2021",
        employmentType: "Full Time",
      },

      {
        id: "node-014",
        name: "Olivia Bennett",
        role: "Product Manager",
        occupied: 2,
        total: 2,
        status: "FILLED",
        image: "https://i.pravatar.cc/100?img=43",

        employeeId: "EMP00130",
        department: "Product",
        location: "Bangalore",
        workEmail: "olivia.bennett@acme.com",
        phone: "+91 98765 43217",
        dateOfJoining: "03 Jan 2022",
        employmentType: "Full Time",
      },

      {
        id: "node-015",
        name: "Product Analyst",
        role: "Product Analyst",
        occupied: 0,
        total: 1,
        status: "VACANT",

        employeeId: "POSITION-PROD-001",
        department: "Product",
        location: "Bangalore",
        workEmail: "",
        phone: "",
        dateOfJoining: "",
        employmentType: "Full Time",
      },
    ],

    relationships: [
      {
        id: "rel-001",
        parentId: "node-001",
        childId: "node-002",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-002",
        parentId: "node-001",
        childId: "node-003",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-003",
        parentId: "node-001",
        childId: "node-004",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-004",
        parentId: "node-001",
        childId: "node-005",
        relationshipType: "DIRECT_REPORTING",
      },

      {
        id: "rel-005",
        parentId: "node-002",
        childId: "node-006",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-006",
        parentId: "node-002",
        childId: "node-007",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-007",
        parentId: "node-006",
        childId: "node-008",
        relationshipType: "DIRECT_REPORTING",
      },

      {
        id: "rel-008",
        parentId: "node-003",
        childId: "node-009",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-009",
        parentId: "node-003",
        childId: "node-010",
        relationshipType: "DIRECT_REPORTING",
      },

      {
        id: "rel-010",
        parentId: "node-004",
        childId: "node-011",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-011",
        parentId: "node-004",
        childId: "node-012",
        relationshipType: "DIRECT_REPORTING",
      },

      {
        id: "rel-012",
        parentId: "node-005",
        childId: "node-013",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-013",
        parentId: "node-005",
        childId: "node-014",
        relationshipType: "DIRECT_REPORTING",
      },
      {
        id: "rel-014",
        parentId: "node-005",
        childId: "node-015",
        relationshipType: "DIRECT_REPORTING",
      },

      {
        id: "rel-015",
        parentId: "node-003",
        childId: "node-002",
        relationshipType: "HR_REPORTING",
      },

      {
        id: "rel-016",
        parentId: "node-001",
        childId: "node-005",
        relationshipType: "JOB_ROLE_HIERARCHY",
      },
    ],
  },
};

/* =========================================================
   CONVERT API DATA
========================================================= */

const users: User[] = hierarchyResponse.data.nodes.map((node) => ({
  id: node.id,
  name: node.name,
  role: node.role,
  image: node.image,
  occupied: node.occupied,
  total: node.total,

  status: node.status?.toLowerCase() as User["status"],

  employeeId: node.employeeId,
  department: node.department,
  location: node.location,
  workEmail: node.workEmail,
  phone: node.phone,
  dateOfJoining: node.dateOfJoining,
  employmentType: node.employmentType,

  reportsTo: node.reportsTo,
}));

const usersById = new Map(users.map((user) => [user.id, user]));

/* =========================================================
   DEFAULT OVERVIEW POSITIONS
========================================================= */

const positions: PositionMap = {
  "node-001": {
    x: 650,
    y: 20,
  },

  "node-002": {
    x: 120,
    y: 170,
  },

  "node-003": {
    x: 450,
    y: 170,
  },

  "node-004": {
    x: 780,
    y: 170,
  },

  "node-005": {
    x: 1110,
    y: 170,
  },

  "node-006": {
    x: 40,
    y: 310,
  },

  "node-007": {
    x: 280,
    y: 310,
  },

  "node-008": {
    x: 40,
    y: 430,
  },

  "node-009": {
    x: 500,
    y: 310,
  },

  "node-010": {
    x: 700,
    y: 310,
  },

  "node-011": {
    x: 800,
    y: 310,
  },

  "node-012": {
    x: 800,
    y: 430,
  },

  "node-013": {
    x: 1100,
    y: 310,
  },

  "node-014": {
    x: 1340,
    y: 310,
  },

  "node-015": {
    x: 1100,
    y: 430,
  },
};

/* =========================================================
   FOCUSED VIEW CONSTANTS
========================================================= */

const FOCUS_PARENT_Y = 30;

const FOCUS_NODE_Y_WITH_PARENTS = 130;

const FOCUS_NODE_Y_NO_PARENTS = 30;

const FOCUS_ROW_GAP = 150;

const FOCUS_CHILD_SPACING = 220;

const FOCUS_CENTER_X = 650;

const NODE_WIDTH = 240;

const LAYOUT_STORAGE_KEY = "hierarchy-node-positions";

/* =========================================================
   STATUS
========================================================= */

function getStatusClass(user: User) {
  if (user.status === "vacant") {
    return "vacant";
  }

  if (user.status === "recruiting") {
    return "recruiting";
  }

  return "filled";
}

/* =========================================================
   USER NODE
========================================================= */

function UserNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const statusClass = getStatusClass(data);

  const clickableClass = data.hasChildren ? "clickable" : "no-children";

  return (
    <div
      className={`user-node ${statusClass} ${clickableClass} ${
        selected ? "selected" : ""
      }`}
    >
      {/* View profile button */}
      <button
        type="button"
        className="user-view-button nodrag nopan"
        title="View profile"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          data.onViewProfile?.(data);
        }}
      >
        <FiEye size={13} />
      </button>

      <Handle
        type="target"
        position={Position.Top}
        id="direct-target"
        style={{
          left: "35%",
          width: 1,
          height: 1,
          opacity: 0,
          border: 0,
          background: "transparent",
        }}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="hr-target"
        style={{
          left: "50%",
          width: 1,
          height: 1,
          opacity: 0,
          border: 0,
          background: "transparent",
        }}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="job-target"
        style={{
          left: "65%",
          width: 1,
          height: 1,
          opacity: 0,
          border: 0,
          background: "transparent",
        }}
      />

      <div className="user-avatar-wrapper">
        {data.image ? (
          <img src={data.image} alt={data.name} className="user-avatar" />
        ) : (
          <div className="vacant-avatar">
            <span>●</span>
          </div>
        )}
      </div>

      <div className="user-info">
        <div className="user-name">{data.name}</div>

        <div className={`user-role ${statusClass}`}>{data.role}</div>
      </div>

      <div className={`user-count ${statusClass}`}>
        {data.occupied}/{data.total}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="direct-source"
        style={{
          left: "35%",
          width: 1,
          height: 1,
          opacity: 0,
          border: 0,
          background: "transparent",
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="hr-source"
        style={{
          left: "50%",
          width: 1,
          height: 1,
          opacity: 0,
          border: 0,
          background: "transparent",
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="job-source"
        style={{
          left: "65%",
          width: 1,
          height: 1,
          opacity: 0,
          border: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}

const nodeTypes = {
  user: UserNode,
};

/* =========================================================
   REACT FLOW EDGES FROM RELATIONSHIP JSON
========================================================= */

const edges: Edge[] = hierarchyResponse.data.relationships.map(
  (relationship) => {
    const relationshipConfig = {
      DIRECT_REPORTING: {
        className: "direct-edge",
        sourceHandle: "direct-source",
        targetHandle: "direct-target",
      },

      HR_REPORTING: {
        className: "hr-edge",
        sourceHandle: "hr-source",
        targetHandle: "hr-target",
      },

      JOB_ROLE_HIERARCHY: {
        className: "job-edge",
        sourceHandle: "job-source",
        targetHandle: "job-target",
      },
    }[relationship.relationshipType];

    return {
      id: relationship.id,

      source: relationship.parentId,

      target: relationship.childId,

      sourceHandle: relationshipConfig.sourceHandle,

      targetHandle: relationshipConfig.targetHandle,

      type: "smoothstep",

      className: relationshipConfig.className,
    };
  },
);

/* =========================================================
   VISIBLE CHILDREN
========================================================= */

function getVisibleChildren(
  id: string,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
): User[] {
  const childIds = Array.from(
    new Set(
      visibleEdges
        .filter((edge) => edge.source === id)
        .map((edge) => edge.target as string),
    ),
  );

  return childIds
    .map((childId) => usersById.get(childId))
    .filter((user): user is User => Boolean(user))
    .filter(
      (user) => !(user.status === "vacant" && !showOptions.vacantPositions),
    );
}

/* =========================================================
   VISIBLE PARENTS
========================================================= */

function getVisibleParents(
  id: string,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
): User[] {
  const parentIds = Array.from(
    new Set(
      visibleEdges
        .filter((edge) => edge.target === id)
        .map((edge) => edge.source as string),
    ),
  );

  return parentIds
    .map((parentId) => usersById.get(parentId))
    .filter((user): user is User => Boolean(user))
    .filter(
      (user) => !(user.status === "vacant" && !showOptions.vacantPositions),
    );
}

/* =========================================================
   NODE DATA
========================================================= */

function toNodeData(
  user: User,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
  onViewProfile?: (user: User) => void,
): NodeData {
  return {
    ...user,

    hasChildren:
      getVisibleChildren(user.id, showOptions, visibleEdges).length > 0,

    onViewProfile,
  };
}

/* =========================================================
   BUILD ROW
========================================================= */

function buildRow(
  rowUsers: User[],
  y: number,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
  onViewProfile?: (user: User) => void,
): Node[] {
  const totalWidth = Math.max(rowUsers.length - 1, 0) * FOCUS_CHILD_SPACING;

  const startX = FOCUS_CENTER_X - totalWidth / 2;

  return rowUsers.map((user, index) => {
    const data = toNodeData(user, showOptions, visibleEdges, onViewProfile);

    return {
      id: user.id,

      type: "user",

      position: {
        x: startX + index * FOCUS_CHILD_SPACING - NODE_WIDTH / 2,

        y,
      },

      data,

      selected: false,

      className: data.hasChildren ? undefined : "no-children-node",
    };
  });
}

/* =========================================================
   BUILD OVERVIEW
========================================================= */

function buildOverviewNodes(
  showOptions: ShowOptions,
  visibleEdges: Edge[],
  onViewProfile?: (user: User) => void,
  customPositions: PositionMap = {},
  draggable: boolean = false,
): Node[] {
  return users
    .filter(
      (user) => !(user.status === "vacant" && !showOptions.vacantPositions),
    )
    .map((user) => {
      const data = toNodeData(user, showOptions, visibleEdges, onViewProfile);

      return {
        id: user.id,

        type: "user",

        // Custom (dragged + saved) position takes priority over the default layout.
        position: customPositions[user.id] ?? positions[user.id],

        data,

        selected: false,

        draggable,

        className: data.hasChildren ? undefined : "no-children-node",
      };
    });
}

/* =========================================================
   BUILD FOCUSED VIEW
========================================================= */

function buildFocusNodes(
  focusedId: string,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
  onViewProfile?: (user: User) => void,
): Node[] {
  const focusedUser = usersById.get(focusedId);

  if (!focusedUser) {
    return buildOverviewNodes(showOptions, visibleEdges);
  }

  const parentUsers = getVisibleParents(focusedId, showOptions, visibleEdges);

  const childUsers = getVisibleChildren(focusedId, showOptions, visibleEdges);

  const nodeY =
    parentUsers.length > 0
      ? FOCUS_NODE_Y_WITH_PARENTS
      : FOCUS_NODE_Y_NO_PARENTS;

  const childY = nodeY + FOCUS_ROW_GAP;

  const parentNodes = buildRow(
    parentUsers,
    FOCUS_PARENT_Y,
    showOptions,
    visibleEdges,
    onViewProfile,
  );

  const childNodes = buildRow(
    childUsers,
    childY,
    showOptions,
    visibleEdges,
    onViewProfile,
  );

  const focusData = toNodeData(
    focusedUser,
    showOptions,
    visibleEdges,
    onViewProfile,
  );

  const focusNode: Node = {
    id: focusedUser.id,

    type: "user",

    position: {
      x: FOCUS_CENTER_X - NODE_WIDTH / 2,

      y: nodeY,
    },

    data: focusData,

    selected: true,

    className: focusData.hasChildren ? undefined : "no-children-node",
  };

  return [...parentNodes, focusNode, ...childNodes];
}

function ProfileRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="profile-row">
      <div className="profile-row-label">{label}</div>

      <div className="profile-row-value">{value || "-"}</div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function UserHierarchy({ showOptions }: UserHierarchyProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);

  const [profileTab, setProfileTab] = useState<
    "details" | "reporting" | "hr" | "jobRole"
  >("details");

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  /* =======================================================
     DRAG / LAYOUT EDITING STATE

     - isDragMode: when true, nodes can be repositioned and the
       "drill into" click behaviour is disabled.
     - savedPositions: the last persisted custom layout (used to
       render the overview whenever we are NOT actively dragging).
     - isDirty: true once the user has moved at least one node
       since entering drag mode / since the last save.
  ======================================================= */

  const [isDragMode, setIsDragMode] = useState(false);

  const [savedPositions, setSavedPositions] = useState<PositionMap>({});

  const [isDirty, setIsDirty] = useState(false);

  // Load any previously saved layout on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);

      if (stored) {
        setSavedPositions(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load saved node positions:", error);
    }
  }, []);

  useEffect(() => {
    console.log({ selectedProfile });
  }, [selectedProfile]);

  const getReportingUsers = (userId: string) => {
    const reportingRelationships = hierarchyResponse.data.relationships.filter(
      (relationship) =>
        relationship.childId === userId &&
        (relationship.relationshipType === "DIRECT_REPORTING" ||
          relationship.relationshipType === "HR_REPORTING"),
    );

    return reportingRelationships
      .map((relationship) =>
        hierarchyResponse.data.nodes.find(
          (node) => node.id === relationship.parentId,
        ),
      )
      .filter(Boolean);
  };

  /* =======================================================
     FILTER RELATIONSHIPS
  ======================================================= */

  const visibleEdges = edges.filter((edge) => {
    if (edge.className === "direct-edge" && !showOptions.directReporting) {
      return false;
    }

    if (edge.className === "hr-edge" && !showOptions.hrReporting) {
      return false;
    }

    if (edge.className === "job-edge" && !showOptions.jobRoleHierarchy) {
      return false;
    }

    return true;
  });

  /* =======================================================
     NODES
  ======================================================= */

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  const handleViewProfile = useCallback((user: User) => {
    setSelectedProfile(user);
    setProfileTab("details");
  }, []);

  /* =======================================================
     REBUILD NODES

     Rebuilds whenever the view (focused node / filters) or the
     saved layout changes. It intentionally does NOT depend on
     `nodes` itself, so in-progress dragging (handled by
     onNodesChange below) is never clobbered mid-drag.
  ======================================================= */

  useEffect(() => {
    const nextNodes = focusedNodeId
      ? buildFocusNodes(
          focusedNodeId,
          showOptions,
          visibleEdges,
          handleViewProfile,
        )
      : buildOverviewNodes(
          showOptions,
          visibleEdges,
          handleViewProfile,
          savedPositions,
          isDragMode,
        );

    setNodes(nextNodes);
  }, [
    focusedNodeId,
    showOptions,
    setNodes,
    handleViewProfile,
    savedPositions,
    isDragMode,
  ]);

  /* =======================================================
     FIT VIEW
  ======================================================= */

  useEffect(() => {
    if (!rfInstance) {
      return;
    }

    // Don't fight the user's own dragging by re-fitting the view
    // every time a node position changes while editing the layout.
    if (isDragMode) {
      return;
    }

    const raf = requestAnimationFrame(() => {
      rfInstance.fitView({
        padding: 0.8,

        minZoom: 0.45,

        maxZoom: 0.6,

        duration: 350,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [nodes, rfInstance, isDragMode]);

  /* =======================================================
     DRAG
  ======================================================= */

  const onNodeDragStop: OnNodeDrag<Node> = useCallback((_event, node) => {
    console.log("Dragged node:", node.id);

    console.log("New position:", node.position);

    setIsDirty(true);
  }, []);

  /* =======================================================
     DRAG MODE / SAVE / CANCEL
  ======================================================= */

  const handleToggleDragMode = useCallback(() => {
    setIsDragMode((current) => {
      if (current) {
        // Turning drag mode off: if there are unsaved moves, make the
        // user explicitly choose Save/Discard below rather than
        // silently losing (or keeping) their changes.
        if (isDirty) {
          return current;
        }

        return false;
      }

      // Entering edit mode: leave the drilled-in view, since
      // drilling is disabled while repositioning nodes.
      setFocusedNodeId(null);

      return true;
    });
  }, [isDirty]);

  const handleSavePositions = useCallback(() => {
    setNodes((currentNodes) => {
      const nextPositions: PositionMap = { ...savedPositions };

      currentNodes.forEach((node) => {
        nextPositions[node.id] = node.position;
      });

      setSavedPositions(nextPositions);

      try {
        window.localStorage.setItem(
          LAYOUT_STORAGE_KEY,
          JSON.stringify(nextPositions),
        );
      } catch (error) {
        console.error("Failed to save node positions:", error);
      }

      return currentNodes;
    });

    setIsDirty(false);
    setIsDragMode(false);
  }, [savedPositions, setNodes]);

  const handleCancelPositions = useCallback(() => {
    // Discard any unsaved dragging by rebuilding from the last
    // saved layout.
    setNodes(
      buildOverviewNodes(
        showOptions,
        visibleEdges,
        handleViewProfile,
        savedPositions,
        false,
      ),
    );

    setIsDirty(false);
    setIsDragMode(false);
  }, [handleViewProfile, savedPositions, setNodes, showOptions, visibleEdges]);

  /* =======================================================
     SNACKBAR
  ======================================================= */

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const snackbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) {
        clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, []);

  const showNothingUnderSnackbar = useCallback(() => {
    if (snackbarTimeoutRef.current) {
      clearTimeout(snackbarTimeoutRef.current);
    }

    setSnackbarVisible(true);

    snackbarTimeoutRef.current = setTimeout(
      () => setSnackbarVisible(false),
      2200,
    );
  }, []);

  /* =======================================================
     NODE CLICK
  ======================================================= */

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      // Drilling into a node is disabled while drag mode is on,
      // so a click just leaves the node selected/draggable.
      if (isDragMode) {
        return;
      }

      setFocusedNodeId((current) => {
        if (current === node.id) {
          return null;
        }

        const hasChildren = Boolean((node.data as NodeData).hasChildren);

        if (!hasChildren) {
          showNothingUnderSnackbar();

          return current;
        }

        return node.id;
      });
    },
    [isDragMode, showNothingUnderSnackbar],
  );

  /* =======================================================
     PANE CLICK
  ======================================================= */

  const onPaneClick = useCallback(() => {
    if (isDragMode) {
      return;
    }

    setFocusedNodeId(null);
  }, [isDragMode]);

  /* =======================================================
     DISPLAY EDGES
  ======================================================= */

  const displayEdges = focusedNodeId
    ? visibleEdges.filter(
        (edge) =>
          edge.source === focusedNodeId || edge.target === focusedNodeId,
      )
    : visibleEdges;

  const handleCloseProfile = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="hierarchy-page">
      <div className="hierarchy-header">
        <h1>User Hierarchy</h1>

        {focusedNodeId && !isDragMode && (
          <button
            type="button"
            className="back-to-overview"
            onClick={() => setFocusedNodeId(null)}
          >
            Back to full hierarchy
          </button>
        )}

        <div className="legend">
          <div className="legend-item">
            <span className="legend-line direct" />
            Direct reporting
          </div>

          <div className="legend-item">
            <span className="legend-line hr" />
            HR reporting
          </div>

          <div className="legend-item">
            <span className="legend-line job" />
            Job role hierarchy
          </div>

          <div className="legend-item">
            <span className="legend-box filled" />
            Filled position
          </div>

          <div className="legend-item">
            <span className="legend-box vacant" />
            Vacant position
          </div>

          <div className="legend-item">
            <span className="legend-box recruiting" />
            Recruitment in progress
          </div>
        </div>
      </div>

      <div className="hierarchy-content">
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setRfInstance}
            nodesDraggable={isDragMode}
            nodesConnectable={false}
            elementsSelectable={isDragMode}
            fitView
            fitViewOptions={{
              padding: 0.35,
              minZoom: 0.6,
              maxZoom: 0.8,
            }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{
              hideAttribution: true,
            }}
          >
            <Background gap={20} size={1} />

            <Controls
              position="top-left"
              showZoom
              showFitView
              showInteractive
              className="hierarchy-controls"
            />

            {/* <MiniMap /> */}
          </ReactFlow>

          <div className="layout-floating-panel">
            <button
              type="button"
              className={`icon-button drag-toggle-button ${
                isDragMode ? "active" : ""
              }`}
              onClick={handleToggleDragMode}
              aria-label={
                isDragMode
                  ? "Exit drag mode"
                  : "Drag to reposition nodes"
              }
              aria-pressed={isDragMode}
              data-tooltip={
                isDragMode
                  ? isDirty
                    ? "Save or discard your changes to exit"
                    : "Click to exit drag mode"
                  : "Drag to reposition nodes"
              }
            >
              <FiMove size={16} />
            </button>

            {isDragMode && isDirty && (
              <div className="layout-confirm">
                <span className="layout-confirm-text">
                  Want to save this layout?
                </span>

                <button
                  type="button"
                  className="text-button text-button-primary"
                  onClick={handleSavePositions}
                >
                  Yes, save
                </button>

                <button
                  type="button"
                  className="text-button"
                  onClick={handleCancelPositions}
                >
                  No, discard
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedProfile && (
          <aside className="profile-panel">
            <div className="profile-header">
              <div className="profile-user">
                {selectedProfile.image ? (
                  <img
                    src={selectedProfile.image}
                    alt={selectedProfile.name}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-vacant">
                    <span>●</span>
                  </div>
                )}

                <div className="profile-user-info">
                  <h2>{selectedProfile.name}</h2>
                  <p>{selectedProfile.role}</p>
                </div>
              </div>

              <button
                type="button"
                className="profile-close"
                onClick={() => setSelectedProfile(null)}
                aria-label="Close profile"
              >
                ×
              </button>
            </div>

            <div
              className={`profile-status ${selectedProfile.status?.toLowerCase()}`}
            >
              <span className="profile-status-dot" />
              {selectedProfile.status === "filled"
                ? "Active"
                : selectedProfile.status === "recruiting"
                  ? "Recruitment in progress"
                  : "Vacant"}
            </div>

            <div className="profile-tabs">
              <button
                type="button"
                className={profileTab === "details" ? "active" : ""}
                onClick={() => setProfileTab("details")}
              >
                Details
              </button>

              <button
                type="button"
                className={profileTab === "reporting" ? "active" : ""}
                onClick={() => setProfileTab("reporting")}
              >
                Reporting
              </button>

              <button
                type="button"
                className={profileTab === "hr" ? "active" : ""}
                onClick={() => setProfileTab("hr")}
              >
                HR
              </button>

              <button
                type="button"
                className={profileTab === "jobRole" ? "active" : ""}
                onClick={() => setProfileTab("jobRole")}
              >
                Job Role
              </button>
            </div>

            <div className="profile-content">
              {profileTab === "details" && (
                <div className="profile-section">
                  <div className="profile-section-title">
                    Employee Information
                  </div>

                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="profile-info-label">Employee ID</span>
                      <span className="profile-info-value">
                        {selectedProfile.employeeId || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">Department</span>
                      <span className="profile-info-value">
                        {selectedProfile.department || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">Location</span>
                      <span className="profile-info-value">
                        {selectedProfile.location || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">Work Email</span>
                      <span className="profile-info-value">
                        {selectedProfile.workEmail || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">Phone</span>
                      <span className="profile-info-value">
                        {selectedProfile.phone || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">
                        Date of Joining
                      </span>
                      <span className="profile-info-value">
                        {selectedProfile.dateOfJoining || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">
                        Employment Type
                      </span>
                      <span className="profile-info-value">
                        {selectedProfile.employmentType || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "reporting" && (
                <div className="profile-section">
                  <div className="profile-section-title">
                    Reporting Structure
                  </div>

                  <div className="reporting-card">
                    <div className="reporting-label">Reports To</div>

                    {(() => {
                      const reportingRelationships =
                        hierarchyResponse.data.relationships.filter(
                          (relationship) =>
                            relationship.childId === selectedProfile.id &&
                            (relationship.relationshipType ===
                              "DIRECT_REPORTING" ||
                              relationship.relationshipType === "HR_REPORTING"),
                        );

                      const reportingUsers = reportingRelationships
                        .map((relationship) =>
                          hierarchyResponse.data.nodes.find(
                            (node) => node.id === relationship.parentId,
                          ),
                        )
                        .filter(Boolean);

                      if (reportingUsers.length === 0) {
                        return (
                          <div className="profile-empty">
                            No reporting information available
                          </div>
                        );
                      }

                      return reportingUsers.map((manager) => {
                        if (!manager) return null;

                        return (
                          <div className="reporting-person" key={manager.id}>
                            {manager.image ? (
                              <img src={manager.image} alt={manager.name} />
                            ) : (
                              <div className="reporting-avatar">
                                {manager.name.charAt(0)}
                              </div>
                            )}

                            <div className="reporting-person-info">
                              <div className="reporting-name">
                                {manager.name}
                              </div>

                              <div className="reporting-role">
                                {manager.role}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {profileTab === "hr" && (
                <div className="profile-section">
                  <div className="profile-section-title">HR Information</div>

                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="profile-info-label">
                        Employment Type
                      </span>

                      <span className="profile-info-value">
                        {selectedProfile.employmentType || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">
                        Date of Joining
                      </span>

                      <span className="profile-info-value">
                        {selectedProfile.dateOfJoining || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">Department</span>

                      <span className="profile-info-value">
                        {selectedProfile.department || "-"}
                      </span>
                    </div>

                    <div className="profile-info-item">
                      <span className="profile-info-label">Location</span>

                      <span className="profile-info-value">
                        {selectedProfile.location || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "jobRole" && (
                <div className="profile-section">
                  <div className="profile-section-title">
                    Job Role Information
                  </div>

                  <div className="job-role-card">
                    <div className="job-role-title">{selectedProfile.role}</div>

                    <div className="job-role-item">
                      <span>Department</span>
                      <strong>{selectedProfile.department || "-"}</strong>
                    </div>

                    <div className="job-role-item">
                      <span>Occupied</span>
                      <strong>
                        {selectedProfile.occupied}/{selectedProfile.total}
                      </strong>
                    </div>

                    <div className="job-role-item">
                      <span>Status</span>
                      <strong>{selectedProfile.status || "-"}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="profile-footer">
              <button type="button" className="view-profile-button">
                View Full Profile
                <span>↗</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      <div className={`hierarchy-snackbar ${snackbarVisible ? "visible" : ""}`}>
        Nothing under it
      </div>
    </main>
  );
}