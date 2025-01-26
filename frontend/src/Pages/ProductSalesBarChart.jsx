import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import axios from "axios";
import "../CSS/ProductSalesBarChart.css";
import Navbar from "./Navbar";

const ProductSalesBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/auth/product-sales-report"
        );
        const data = response.data;

        const chartData = [
          ["Product", "Total Sales"],
          ...data.map((product) => [product.productName, product.totalSales]),
        ];

        setChartData(chartData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching sales data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const options = {
    title: "Product Sales",
    chartArea: { width: "50%", height: "80%" },
    hAxis: {
      title: "Total Sales",
      minValue: 0,
    },
    vAxis: {
      title: "Product",
    },
  };

  return (
    <>
      <Navbar />
      <div className="product-sales-chart">
        <h2>Product Sales Bar Chart</h2>
        <Chart
          chartType="BarChart"
          width="100%"
          height="400px"
          data={chartData}
          options={options}
        />
      </div>
    </>
  );
};

export default ProductSalesBarChart;
