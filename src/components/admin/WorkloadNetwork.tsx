"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as d3Force from "d3-force";
import * as d3Zoom from "d3-zoom";
import * as d3Selection from "d3-selection";
import * as d3Drag from "d3-drag";

interface NetworkNode extends d3Force.SimulationNodeDatum {
  id: string;
  type: "user" | "project";
  name: string;
  role?: string;
  teamName?: string;
  taskCount: number;
}

interface NetworkLink extends d3Force.SimulationLinkDatum<NetworkNode> {
  taskCount: number;
}

const ROLE_COLORS: Record<string, string> = {
  Admin: "#ef4444",
  "Team Lead": "#f59e0b",
  Member: "#64748b",
};

const PROJECT_COLOR = "#6366f1";

export default function WorkloadNetwork() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["workloadNetwork"],
    queryFn: async () => {
      const res = await fetch("/api/admin/workload-network");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load network data");
      return json.data as { nodes: NetworkNode[]; links: NetworkLink[] };
    },
  });

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const svg = d3Selection.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    svg.call(
      zoom.transform,
      d3Zoom.zoomIdentity.translate(width / 2, height / 2).scale(1)
    );

    const nodes = data.nodes.map((n) => ({ ...n })) as NetworkNode[];
    const links = data.links.map((l) => ({ ...l })) as NetworkLink[];

    const maxTaskCount = Math.max(...nodes.map((n) => n.taskCount), 1);

    const simulation = d3Force
      .forceSimulation<NetworkNode>(nodes)
      .force(
        "link",
        d3Force
          .forceLink<NetworkNode, NetworkLink>(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3Force.forceManyBody().strength(-400))
      .force("center", d3Force.forceCenter(0, 0))
      .force("collision", d3Force.forceCollide().radius(40));

    // Draw links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.max(1, Math.min(d.taskCount * 0.8, 6)));

    // Separate user and project nodes
    const userNodes = nodes.filter((n) => n.type === "user");
    const projectNodes = nodes.filter((n) => n.type === "project");

    // User nodes (circles)
    const userGroup = g
      .append("g")
      .selectAll<SVGGElement, NetworkNode>("g")
      .data(userNodes)
      .join("g")
      .call(
        d3Drag.drag<SVGGElement, NetworkNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const userRadius = (d: NetworkNode) => 14 + (d.taskCount / maxTaskCount) * 14;

    userGroup
      .append("circle")
      .attr("r", userRadius)
      .attr("fill", (d) => ROLE_COLORS[d.role ?? "Member"] ?? ROLE_COLORS.Member)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9);

    userGroup
      .append("text")
      .text((d) => d.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase())
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-weight", 600)
      .attr("pointer-events", "none");

    // Project nodes (rounded rectangles)
    const projectGroup = g
      .append("g")
      .selectAll<SVGGElement, NetworkNode>("g")
      .data(projectNodes)
      .join("g")
      .call(
        d3Drag.drag<SVGGElement, NetworkNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const rectWidth = (d: NetworkNode) => 80 + (d.taskCount / maxTaskCount) * 40;
    const rectHeight = 32;

    projectGroup
      .append("rect")
      .attr("width", (d) => rectWidth(d))
      .attr("height", rectHeight)
      .attr("x", (d) => -rectWidth(d) / 2)
      .attr("y", -rectHeight / 2)
      .attr("rx", 8)
      .attr("fill", PROJECT_COLOR)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9);

    projectGroup
      .append("text")
      .text((d) => d.name.length > 12 ? d.name.slice(0, 11) + "..." : d.name)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .attr("font-weight", 600)
      .attr("pointer-events", "none");

    // Hover tooltip + click highlight bound directly to each selection
    const bindNodeEvents = (selection: d3Selection.Selection<SVGGElement, NetworkNode, SVGGElement, unknown>) => {
      selection
        .on("mouseover", (event: MouseEvent, d: NetworkNode) => {
          const info = d.type === "user"
            ? `${d.name} (${d.role}) - ${d.taskCount} tasks`
            : `${d.name}${d.teamName ? ` [${d.teamName}]` : ""} - ${d.taskCount} tasks`;
          const rect = container.getBoundingClientRect();
          setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top - 40, content: info });
        })
        .on("mouseout", () => setTooltip(null))
        .on("click", (event: MouseEvent, d: NetworkNode) => {
          event.stopPropagation();
          const connectedIds = new Set<string>();
          connectedIds.add(d.id);

          links.forEach((l) => {
            const srcId = typeof l.source === "object" ? (l.source as NetworkNode).id : l.source;
            const tgtId = typeof l.target === "object" ? (l.target as NetworkNode).id : l.target;
            if (srcId === d.id) connectedIds.add(String(tgtId));
            if (tgtId === d.id) connectedIds.add(String(srcId));
          });

          userGroup.select("circle")
            .transition().duration(200)
            .attr("opacity", (n) => connectedIds.has(n.id) ? 1 : 0.15);
          userGroup.select("text")
            .transition().duration(200)
            .attr("opacity", (n) => connectedIds.has(n.id) ? 1 : 0.15);
          projectGroup.select("rect")
            .transition().duration(200)
            .attr("opacity", (n) => connectedIds.has(n.id) ? 1 : 0.15);
          projectGroup.select("text")
            .transition().duration(200)
            .attr("opacity", (n) => connectedIds.has(n.id) ? 1 : 0.15);
          link
            .transition().duration(200)
            .attr("stroke-opacity", (l) => {
              const srcId = typeof l.source === "object" ? (l.source as NetworkNode).id : l.source;
              const tgtId = typeof l.target === "object" ? (l.target as NetworkNode).id : l.target;
              return (srcId === d.id || tgtId === d.id) ? 0.8 : 0.05;
            });
        });
    };

    bindNodeEvents(userGroup);
    bindNodeEvents(projectGroup);

    // Click on background to reset highlight
    svg.on("click", () => {
      userGroup.select("circle").transition().duration(200).attr("opacity", 0.9);
      userGroup.select("text").transition().duration(200).attr("opacity", 1);
      projectGroup.select("rect").transition().duration(200).attr("opacity", 0.9);
      projectGroup.select("text").transition().duration(200).attr("opacity", 1);
      link.transition().duration(200).attr("stroke-opacity", 0.6);
    });

    // Tick update positions
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NetworkNode).x ?? 0)
        .attr("y1", (d) => (d.source as NetworkNode).y ?? 0)
        .attr("x2", (d) => (d.target as NetworkNode).x ?? 0)
        .attr("y2", (d) => (d.target as NetworkNode).y ?? 0);

      userGroup.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      projectGroup.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Loading network data...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Failed to load network data
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
