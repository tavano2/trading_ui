import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

const StockCandlestickChart = () => {
    // 차트 옵션 설정
    const [chartOptions,] = useState({
        chart: {
            type: "candlestick",
            height: 350,
            animations: {
                enabled: true,
                easing: "linear",
                dynamicAnimation: {
                    speed: 1000,
                },
            },
            toolbar: {
                show: true,
            },
        },
        title: {
            text: "Real-Time Stock Candlestick Chart",
            align: "left",
        },
        xaxis: {
            type: "datetime",
            labels: {
                formatter: function (value) {
                    return new Date(value).toLocaleTimeString();
                },
            },
        },
        yaxis: {
            tooltip: {
                enabled: true,
            },
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: "#00B746", // 상승 봉 색상
                    downward: "#EF403C", // 하락 봉 색상
                },
            },
        },
    });

    // 차트 데이터 상태
    const [chartSeries, setChartSeries] = useState([
        {
            name: "AAPL",
            data: [], // 초기 데이터는 비어있음
        },
        {
            name: "NVDA",
            data: [], // 초기 데이터는 비어있음
        },
    ]);

    const fetchStockData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/stocks");

            // 함수형 업데이트 사용
            setChartSeries((prevSeries) => {
                return prevSeries.map((series) => {
                    const stockData = response.data[series.name]; // 현재 주식 데이터
                    if (!stockData) return series; // 데이터가 없으면 무시

                    const newCandle = {
                        x: stockData.timestamp, // 분 단위 timestamp
                        y: [
                            stockData.open, // 시가
                            stockData.high, // 고가
                            stockData.low, // 저가
                            stockData.close, // 종가
                        ],
                    };

                    // 초기 데이터가 없는 경우: 새로운 캔들 추가
                    if (series.data.length === 0) {
                        return {
                            ...series,
                            data: [newCandle], // 새로운 배열 생성
                        };
                    }

                    // 기존 데이터에서 같은 타임스탬프가 있는지 확인
                    const existingCandleIndex = series.data.findIndex(
                        (candle) => candle.x === stockData.timestamp
                    );

                    let newData;
                    // 같은 타임스탬프가 있는 경우: 캔들 업데이트
                    if (existingCandleIndex !== -1) {
                        newData = series.data.map((candle, index) =>
                            index === existingCandleIndex ? newCandle : candle
                        );
                    }
                    // 같은 타임스탬프가 없는 경우: 새로운 캔들 추가
                    else {
                        newData = [...series.data, newCandle];
                    }

                    // 최대 60개의 데이터만 유지 (1시간 동안 1분 간격으로 60개)
                    if (newData.length > 60) {
                        newData.shift(); // 오래된 데이터 제거
                    }

                    return {
                        ...series,
                        data: newData, // 새로운 배열 반환
                    };
                });
            });
        } catch (error) {
            console.error("Error fetching stock data:", error);
        }
    };

    // 컴포넌트가 마운트될 때 데이터를 가져옴
    useEffect(() => {
        fetchStockData();
        const interval = setInterval(fetchStockData, 1000); // 1초마다
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ margin: "20px" }}>
            <Chart
                options={chartOptions}
                series={chartSeries}
                type="candlestick"
                width="800"
                height="350"
            />
        </div>
    );
};

export default StockCandlestickChart;