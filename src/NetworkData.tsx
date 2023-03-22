import { axisLeft, line, scaleLinear, select } from "d3";
import { useRef } from "react";


export default function NetworkData() {
    const ref = useRef<SVGSVGElement>(null);
    const svg = select(ref.current);
    const margin = 15
    const width = 300 - margin * 2 // +svg.attr("width") - margin
    const height = 180 - margin * 2 //+svg.attr("height") - margin

    svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)
        .attr("class", "chart")
    const chart = svg.select("g.chart")
    chart.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f8f8f8")
    const yScale = scaleLinear()
        .domain([0, 100])
        .range([height, 0])
    chart.append("g")
        .call(axisLeft(yScale))
    const l: any = line()
        .y((d: any[]) => yScale(d[1]))
    chart.append("path")
        .datum([1, 1])
        .attr("class", "line")
        .attr("d", l)
        .attr("fill", "none")
        .attr("stroke", "#772277")
        .attr("stroke-opacity", 0.75)

    return (
        <div style={{ width: "100%", margin: "10px" }}>
            <svg ref={ref} viewBox="0 0 300 180" style={{ border: "solid 1px gray" }}></svg>
        </div>
    )
}