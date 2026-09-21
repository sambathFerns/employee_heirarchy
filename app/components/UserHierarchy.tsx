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

import { FiArrowLeft } from "react-icons/fi";

import { useCallback, useEffect, useRef, useState } from "react";

type UserStatus = "filled" | "vacant" | "recruiting";

type User = {
  id: string;
  name: string;
  role: string;
  image?: string;
  occupied: number;
  total: number;
  status?: UserStatus;
};

// Extra render-only field: whether this card has any visible relation below
// it. Cards without one aren't clickable — nothing to drill into.
type NodeData = User & { hasChildren: boolean };

const users: User[] = [
  {
    id: "ceo",
    name: "Timothy Brand",
    role: "CEO",
    occupied: 1,
    total: 1,
    image: "https://i.pravatar.cc/100?img=11",
  },
  {
    id: "cto",
    name: "Alex Johnstone",
    role: "CTO",
    occupied: 3,
    total: 5,
    image: "https://i.pravatar.cc/100?img=12",
    status: "recruiting",
  },
  {
    id: "hr",
    name: "Emily Watson",
    role: "HR Manager",
    occupied: 2,
    total: 2,
    image: "https://i.pravatar.cc/100?img=47",
  },
  {
    id: "cro",
    name: "Sabrina White",
    role: "CRO",
    occupied: 2,
    total: 2,
    image: "https://i.pravatar.cc/100?img=44",
  },
  {
    id: "product-lead",
    name: "Tommy Miller",
    role: "Lead Product Manager",
    occupied: 2,
    total: 3,
    image: "https://i.pravatar.cc/100?img=13",
    status: "recruiting",
  },
  {
    id: "qa",
    name: "William Scott",
    role: "QA Manager",
    occupied: 3,
    total: 3,
    image: "https://i.pravatar.cc/100?img=14",
  },
  {
    id: "frontend",
    name: "Jack Wilson",
    role: "Frontend Developer",
    occupied: 1,
    total: 1,
    image: "https://i.pravatar.cc/100?img=15",
  },
  {
    id: "backend",
    name: "Samuel Parker",
    role: "Backend Developer",
    occupied: 1,
    total: 1,
    image: "https://i.pravatar.cc/100?img=16",
  },
  {
    id: "recruiter",
    name: "Chloe Morgan",
    role: "Recruiter",
    occupied: 2,
    total: 2,
    image: "https://i.pravatar.cc/100?img=48",
  },
  {
    id: "hr-executive",
    name: "Hannah Stevens",
    role: "HR Executive",
    occupied: 0,
    total: 1,
    image: "https://i.pravatar.cc/100?img=49",
    status: "vacant",
  },
  {
    id: "account",
    name: "Charles Lancaster",
    role: "Account Executive",
    occupied: 3,
    total: 4,
    image: "https://i.pravatar.cc/100?img=51",
    status: "recruiting",
  },
  {
    id: "crm",
    name: "Kimmi Chin",
    role: "CRM Administrator",
    occupied: 2,
    total: 2,
    image: "https://i.pravatar.cc/100?img=17",
  },
  {
    id: "product-1",
    name: "Jessica Clarke",
    role: "Product Manager",
    occupied: 2,
    total: 2,
    image: "https://i.pravatar.cc/100?img=45",
  },
  {
    id: "product-2",
    name: "Olivia Bennett",
    role: "Product Manager",
    occupied: 2,
    total: 2,
    image: "https://i.pravatar.cc/100?img=43",
  },
  {
    id: "product-analyst",
    name: "Product Analyst",
    role: "Vacant",
    occupied: 0,
    total: 1,
    status: "vacant",
  },
];

const usersById = new Map(users.map((user) => [user.id, user]));

type ShowOptions = {
  directReporting: boolean;
  hrReporting: boolean;
  jobRoleHierarchy: boolean;
  vacantPositions: boolean;
};

type UserHierarchyProps = {
  showOptions: ShowOptions;
};

// Default (overview) layout — unchanged from the original chart.
const positions: Record<string, { x: number; y: number }> = {
  ceo: { x: 650, y: 20 },

  cto: { x: 120, y: 170 },
  hr: { x: 450, y: 170 },
  cro: { x: 780, y: 170 },
  "product-lead": { x: 1110, y: 170 },

  qa: { x: 40, y: 310 },
  frontend: { x: 280, y: 310 },
  backend: { x: 40, y: 430 },

  recruiter: { x: 500, y: 310 },
  "hr-executive": { x: 700, y: 310 },

  account: { x: 800, y: 310 },
  crm: { x: 800, y: 430 },

  "product-1": { x: 1100, y: 310 },
  "product-2": { x: 1340, y: 310 },
  "product-analyst": { x: 1100, y: 430 },
};

// Layout constants for the focused ("drill-down") view.
const FOCUS_PARENT_Y = 30;
const FOCUS_NODE_Y_WITH_PARENTS = 130;
const FOCUS_NODE_Y_NO_PARENTS = 30;
const FOCUS_ROW_GAP = 150;
const FOCUS_CHILD_SPACING = 220;
const FOCUS_CENTER_X = 650;
const NODE_WIDTH = 240;

function getStatusClass(user: User) {
  if (user.status === "vacant") {
    return "vacant";
  }

  if (user.status === "recruiting") {
    return "recruiting";
  }

  return "filled";
}

function UserNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const statusClass = getStatusClass(data);
  const clickableClass = data.hasChildren ? "clickable" : "no-children";

  return (
    <div
      className={`user-node ${statusClass} ${clickableClass} ${
        selected ? "selected" : ""
      }`}
    >
      {/* Direct reporting target */}
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

      {/* HR reporting target */}
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

      {/* Job role target */}
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

      {/* Direct reporting source */}
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

      {/* HR reporting source */}
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

      {/* Job role source */}
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

// Every edge explicitly declares which handle it leaves from/arrives at
// (direct-source/target, hr-source/target, job-source/target) so the three
// relationship types fan out from separate points on each node instead of
// stacking on top of one another.
const edges: Edge[] = [
  {
    id: "ceo-cto",
    source: "ceo",
    sourceHandle: "direct-source",
    target: "cto",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "ceo-hr",
    source: "ceo",
    sourceHandle: "direct-source",
    target: "hr",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "ceo-cro",
    source: "ceo",
    sourceHandle: "direct-source",
    target: "cro",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "ceo-product",
    source: "ceo",
    sourceHandle: "direct-source",
    target: "product-lead",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "cto-qa",
    source: "cto",
    sourceHandle: "direct-source",
    target: "qa",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "cto-frontend",
    source: "cto",
    sourceHandle: "direct-source",
    target: "frontend",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "qa-backend",
    source: "qa",
    sourceHandle: "direct-source",
    target: "backend",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "hr-recruiter",
    source: "hr",
    sourceHandle: "direct-source",
    target: "recruiter",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "hr-executive",
    source: "hr",
    sourceHandle: "direct-source",
    target: "hr-executive",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "cro-account",
    source: "cro",
    sourceHandle: "direct-source",
    target: "account",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "cro-crm",
    source: "cro",
    sourceHandle: "direct-source",
    target: "crm",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "product-manager-1",
    source: "product-lead",
    sourceHandle: "direct-source",
    target: "product-1",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "product-manager-2",
    source: "product-lead",
    sourceHandle: "direct-source",
    target: "product-2",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "product-analyst",
    source: "product-lead",
    sourceHandle: "direct-source",
    target: "product-analyst",
    targetHandle: "direct-target",
    type: "smoothstep",
    className: "direct-edge",
  },
  {
    id: "hr-report-cto",
    source: "hr",
    sourceHandle: "hr-source",
    target: "cto",
    targetHandle: "hr-target",
    type: "smoothstep",
    className: "hr-edge",
  },
  {
    id: "job-role-ceo-product",
    source: "ceo",
    sourceHandle: "job-source",
    target: "product-lead",
    targetHandle: "job-target",
    type: "smoothstep",
    className: "job-edge",
  },
];

// Direct children of `id` that are actually visible right now (respects the
// current relation-type and vacant-position toggles).
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

// Who `id` reports to right now (respects the same toggles). A card can have
// more than one — e.g. a direct-reporting manager and a separate HR-reporting
// manager.
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

function toNodeData(
  user: User,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
): NodeData {
  return {
    ...user,
    hasChildren:
      getVisibleChildren(user.id, showOptions, visibleEdges).length > 0,
  };
}

function buildRow(
  rowUsers: User[],
  y: number,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
): Node[] {
  const totalWidth = Math.max(rowUsers.length - 1, 0) * FOCUS_CHILD_SPACING;
  const startX = FOCUS_CENTER_X - totalWidth / 2;

  return rowUsers.map((user, index) => {
    const data = toNodeData(user, showOptions, visibleEdges);
    return {
      id: user.id,
      type: "user",
      position: { x: startX + index * FOCUS_CHILD_SPACING - NODE_WIDTH / 2, y },
      data,
      selected: false,
      className: data.hasChildren ? undefined : "no-children-node",
    };
  });
}

function buildOverviewNodes(
  showOptions: ShowOptions,
  visibleEdges: Edge[],
): Node[] {
  return users
    .filter(
      (user) => !(user.status === "vacant" && !showOptions.vacantPositions),
    )
    .map((user) => {
      const data = toNodeData(user, showOptions, visibleEdges);
      return {
        id: user.id,
        type: "user",
        position: positions[user.id],
        data,
        selected: false,
        className: data.hasChildren ? undefined : "no-children-node",
      };
    });
}

function buildFocusNodes(
  focusedId: string,
  showOptions: ShowOptions,
  visibleEdges: Edge[],
): Node[] {
  const focusedUser = usersById.get(focusedId);
  if (!focusedUser) return buildOverviewNodes(showOptions, visibleEdges);

  const parentUsers = getVisibleParents(focusedId, showOptions, visibleEdges);
  const childUsers = getVisibleChildren(focusedId, showOptions, visibleEdges);

  // Three tiers: who the focused card reports to (top), the focused card
  // itself, and its own direct relations (bottom). The middle row shifts
  // down only when there's actually a "reports to" row above it.
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
  );
  const childNodes = buildRow(childUsers, childY, showOptions, visibleEdges);

  const focusData = toNodeData(focusedUser, showOptions, visibleEdges);
  const focusNode: Node = {
    id: focusedUser.id,
    type: "user",
    position: { x: FOCUS_CENTER_X - NODE_WIDTH / 2, y: nodeY },
    data: focusData,
    selected: true,
    className: focusData.hasChildren ? undefined : "no-children-node",
  };

  return [...parentNodes, focusNode, ...childNodes];
}

export default function UserHierarchy({ showOptions }: UserHierarchyProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

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

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  // Rebuild the node layout whenever focus or the visibility toggles change.
  useEffect(() => {
    const nextNodes = focusedNodeId
      ? buildFocusNodes(focusedNodeId, showOptions, visibleEdges)
      : buildOverviewNodes(showOptions, visibleEdges);

    setNodes(nextNodes);
  }, [focusedNodeId, showOptions, setNodes]);

  // Re-fit the view any time the node set/layout changes.
  useEffect(() => {
    if (!rfInstance) return;

    const raf = requestAnimationFrame(() => {
      rfInstance.fitView({
        padding: 0.8,
        minZoom: 0.45,
        maxZoom: 0.6,
        duration: 350,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [nodes, rfInstance]);

  // Kept in place intentionally: dragging is turned off via
  // `nodesDraggable={false}` below, not by deleting this handler, so it's a
  // one-line flip to re-enable dragging later.
  const onNodeDragStop: OnNodeDrag<Node> = useCallback((_event, node) => {
    console.log("Dragged node:", node.id);

    console.log("New position:", node.position);
  }, []);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const snackbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    };
  }, []);

  const showNothingUnderSnackbar = useCallback(() => {
    if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    setSnackbarVisible(true);
    snackbarTimeoutRef.current = setTimeout(
      () => setSnackbarVisible(false),
      2200,
    );
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
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
    [showNothingUnderSnackbar],
  );

  const onPaneClick = useCallback(() => setFocusedNodeId(null), []);

  const displayEdges = focusedNodeId
    ? visibleEdges.filter(
        (edge) =>
          edge.source === focusedNodeId || edge.target === focusedNodeId,
      )
    : visibleEdges;

  return (
    <main className="hierarchy-page">
      <div className="hierarchy-header">
        <h1>User Hierarchy</h1>

        {focusedNodeId && (
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
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{
            padding: 0.35,
            minZoom: 0.6,
            maxZoom: 0.8,
          }}
          minZoom={0.3}
          maxZoom={1.5}
        >
          <Background gap={20} size={1} />

          <Controls
            position="top-left"
            showZoom
            showFitView
            showInteractive
            className="hierarchy-controls"
          />

          <MiniMap />
        </ReactFlow>
      </div>

      <div className={`hierarchy-snackbar ${snackbarVisible ? "visible" : ""}`}>
        Nothing under it
      </div>
    </main>
  );
}
