import React, { useCallback, useEffect, useState } from "react";
import "./canvas.css";

const Canvas = () => {
  const [data, setData] = useState([]);
  const [baseTemperature, setBaseTemperature] = useState(0);
  const [isDrawed, setIsDrawed] = useState(false);

  const fetchData = () => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setData(data.monthlyVariance);
        setBaseTemperature(data.baseTemperature);
      });
  };

  const initData = useCallback(() => {
    console.log(data);
  }, [data]);

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
      <div id="canvas-container"></div>
    </div>
  );
};

export default Canvas;
