import React, { useCallback, useEffect, useRef, useState } from "react";
import "./canvas.css";
import * as d3 from "d3";

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

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
      .range([padding, width - padding]);

    const yScale = d3
      .scaleTime()
      .range([padding, height - padding])
      .domain(d3.extent(data, (d) => d.month));

    console.log(yScale(new Date(2000, 2, 1)));

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

    svg
      .append("g")
      .style("transform", `translateY(${height - padding}px)`)
      .call(xAxis);
    svg.append("g").style("transform", `translate(${padding}px)`).call(yAxis);

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
      .attr("height", cellHeight)
      .attr("width", cellWidth)
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.month) - cellHeight);
  }, [data]);

  const resizeData = () => {};

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
