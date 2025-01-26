import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

const StockChart = () => {
    const chartContainerRef = useRef(null);
    const [stockData, setStockData] = useState({
        NVDA: [],
        AAPL: [],
    });

    // API에서 주식 데이터를 가져오는 함수
    const fetchStockData = async () => {
        try {
            // API 호출 (예: http://localhost:5000/stocks)
            const response = await fetch("http://localhost:5000/stocks");
            const data = await response.json();

            // 새로운 데이터 포인트 생성 (timestamp 사용)
            const timestamp = Date.now(); // 현재 시간을 밀리초 단위로 가져옴

            // 이전 데이터의 마지막 timestamp와 비교하여 중복 방지
            setStockData((prevData) => {
                const lastNVDA = prevData.NVDA[prevData.NVDA.length - 1];
                const lastAAPL = prevData.AAPL[prevData.AAPL.length - 1];

                const newNVDA = lastNVDA && lastNVDA.time === timestamp ? prevData.NVDA : [
                    ...prevData.NVDA,
                    { time: timestamp, value: data.NVDA },
                ];

                const newAAPL = lastAAPL && lastAAPL.time === timestamp ? prevData.AAPL : [
                    ...prevData.AAPL,
                    { time: timestamp, value: data.AAPL },
                ];

                return {
                    NVDA: newNVDA,
                    AAPL: newAAPL,
                };
            });
        } catch (error) {
            console.error("Error fetching stock data:", error);
        }
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 차트 생성
        const chart = createChart(chartContainerRef.current, {
            width: 800,
            height: 500,
            layout: {
                backgroundColor: "#1e1e1e",
                textColor: "#ffffff",
            },
            grid: {
                vertLines: {
                    color: "#333",
                },
                horzLines: {
                    color: "#333",
                },
            },
            timeScale: {
                timeVisible: true, // 시간 표시 활성화
                secondsVisible: true, // 초 단위 표시 활성화
            },
        });

        // 라인 시리즈 추가 (NVDA)
        const nvdaSeries = chart.addLineSeries({
            color: "#26a69a",
            lineWidth: 2,
        });

        // 라인 시리즈 추가 (AAPL)
        const aaplSeries = chart.addLineSeries({
            color: "#ef5350",
            lineWidth: 2,
        });

        // 데이터 설정
        nvdaSeries.setData(stockData.NVDA);
        aaplSeries.setData(stockData.AAPL);

        // 차트 크기 조정
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener("resize", handleResize);

        // 컴포넌트 언마운트 시 리소스 정리
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [stockData]);

    // 실시간 데이터 업데이트
    useEffect(() => {
        fetchStockData();
        const interval = setInterval(fetchStockData, 1000); // 1초마다 데이터 갱신
        return () => clearInterval(interval);
    }, []);

    return <div ref={chartContainerRef} style={{ width: "100%", height: "500px" }} />;
};

export default StockChart;