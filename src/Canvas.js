import React, { useCallback, useEffect, useRef, useState } from "react";
import "./canvas.css";
import * as d3 from "d3";

const colors = [
  { color: "#0274f5", temp: 3.9 },
  { color: "#21b9ff", temp: 5.0 },
  { color: "#70cffa", temp: 6.1 },
  { color: "#bee6f7", temp: 7.2 },
  { color: "#f0ff7a", temp: 8.3 },
  { color: "#fccc6d", temp: 9.5 },
  { color: "#fca800", temp: 10.6 },
  { color: "#f55b14", temp: 11.7 },
  { color: "#ff0000", temp: 12.8 },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Canvas = () => {
  const [data, setData] = useState([]);
  const [baseTemperature, setBaseTemperature] = useState(0);
  const [isDrawed, setIsDrawed] = useState(false);
  const containerRef = useRef();

  const fetchData = () => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setData(
          data.monthlyVariance.map((d) => {
            const month = new Date(2000, d.month, 1);
            return { ...d, month };
          })
        );
        setBaseTemperature(data.baseTemperature);
      });
  };

  const initData = useCallback(() => {
    const width = containerRef.current.getBoundingClientRect().width;
    const height = containerRef.current.getBoundingClientRect().height;

    const padding = 60;

    const svg = d3
      .select("#canvas-container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    const tooltip = d3
      .select("#canvas-container")
      .append("div")
      .style("opacity", "0")
      .attr("id", "tooltip");

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleTime()
      .range([padding, height - padding])
      .domain(d3.extent(data, (d) => d.month));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

    svg
      .append("g")
      .style("transform", `translateY(${height - padding}px)`)
      .attr("id", "x-axis")
      .call(xAxis);
    svg
      .append("g")
      .style("transform", `translate(${padding}px)`)
      .attr("id", "y-axis")
      .call(yAxis);

    const cellWidth =
      (width - padding * 2) /
      (d3.max(data, (d) => d.year) - d3.min(data, (d) => d.year));
    const cellHeight = (height - padding) / 12;

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month.getMonth())
      .attr("data-year", data.year)
      .attr("data-temp", (d) => baseTemperature + d.variance)
      .attr("height", cellHeight)
      .attr("width", cellWidth)
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month) - cellHeight)
      .attr("fill", (d) => {
        const total = baseTemperature + d.variance;

        const res = colors.find((c) => total < c.temp);

        return res ? res.color : "#a50000";
      })
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<p>${d.year} - ${months[d.month.getMonth()]}</p>
           <p>temp : ${(baseTemperature + d.variance).toFixed(2)}°</p>
           <p>${d.variance}°</p>     
          `
          )
          .style("opacity", "0.9")
          .style(
            "transform",
            `translate(${xScale(d.year) + 10}px,${yScale(d.month) - 100}px)`
          );
      })
      .on("mouseout", (d, e) => {
        tooltip
          .style("opacity", "0")
          .style("transform", `translateY(${height}px)`);
      });
  }, [data, baseTemperature]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length && !isDrawed) {
      setIsDrawed(true);
      initData();
    }
  }, [data, initData, isDrawed]);

  return (
    <div className="app-center">
      <div id="title">
        <h1>Monthly Global Land-Surface Temperature</h1>
        <h3>1753-2015 base temperature {baseTemperature}°</h3>
      </div>
      <div id="canvas-container" ref={containerRef}></div>
    </div>
  );
};

export default Canvas;
