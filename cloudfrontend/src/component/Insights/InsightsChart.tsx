import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Define the data shape for our chart
export interface DataPoint {
    date: string;
    uploads?: number;
    downloads?: number;
    storageUsed?: number;
    [key: string]: any; // Allow for additional metrics
}

// File stats interfaces
interface FileTypeStats {
    type: string;
    count: number;
}

interface TagStats {
    tag: string;
    count: number;
}

interface FileSizeStats {
    sizeRange: string;
    count: number;
}

interface FileStats {
    totalFiles: number;
    totalSize: number;
    averageSize: number;
    fileTypes: FileTypeStats[];
    tags: TagStats[];
    fileSizes: FileSizeStats[];
}

interface InsightsChartProps {
    title?: string;
    description?: string;
    metrics?: string[]; // Which metrics to show
    timeRange?: 'day' | 'week' | 'month' | 'year';
    isDarkMode?: boolean;
    className?: string;
}

const InsightsChart: React.FC<InsightsChartProps> = ({
    title = 'Usage Insights',
    description = 'Visualizing your cloud usage patterns over time',
    metrics = ['uploads', 'downloads', 'storageUsed'],
    timeRange = 'week',
    isDarkMode = false,
    className = '',
}) => {
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [fileStats, setFileStats] = useState<FileStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMetric, setActiveMetric] = useState<string | null>(null);

    // Colors for the different metrics
    const colorMap: Record<string, string> = {
        uploads: '#4ade80', // green
        downloads: '#60a5fa', // blue
        storageUsed: '#f97316', // orange
    };

    // Colors for pie charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

    // Custom names for the metrics
    const metricNames: Record<string, string> = {
        uploads: 'Uploads',
        downloads: 'Downloads',
        storageUsed: 'Storage Used',
    };

    // Units for the metrics
    const metricUnits: Record<string, string> = {
        uploads: 'files',
        downloads: 'files',
        storageUsed: 'MB',
    };

    // Fetch file statistics from the API
    useEffect(() => {
        const fetchFileStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response:any = await axios.get('https://cloudnestaibackend.onrender.com/api/files/stats');
                setFileStats(response.data);

                // Generate mock time-series data based on the stats
                // In a real application, you would fetch this from a dedicated endpoint
                const mockTimeSeriesData = generateMockTimeSeriesData(response.data);
                setChartData(mockTimeSeriesData);
            } catch (err) {
                console.error('Error fetching file stats:', err);
                setError('Failed to load file statistics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFileStats();
    }, [timeRange]);

    // Function to generate mock time-series data based on the stats
    const generateMockTimeSeriesData = (stats: FileStats): DataPoint[] => {
        if (!stats) return [];

        const data: DataPoint[] = [];
        const now = new Date();
        const totalDays = timeRange === 'day' ? 24 :
            timeRange === 'week' ? 7 :
                timeRange === 'month' ? 30 : 365;

        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(0, 0, 0, 0);

            if (timeRange === 'day') {
                date.setHours(now.getHours() - i);
            } else {
                date.setDate(now.getDate() - i);
            }

            // Create somewhat realistic data patterns
            const dayFactor = Math.sin(i / (totalDays / Math.PI)) * 0.5 + 0.5;
            const randomFactor = 0.7 + Math.random() * 0.6;

            data.push({
                date: timeRange === 'day'
                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : date.toLocaleDateString(),
                uploads: Math.round((stats.totalFiles / totalDays) * dayFactor * randomFactor),
                downloads: Math.round((stats.totalFiles / totalDays) * 1.2 * dayFactor * randomFactor),
                storageUsed: Math.round((stats.totalSize / totalDays) * dayFactor * randomFactor)
            });
        }

        return data;
    };

    // Custom tooltip component for better styling
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded shadow-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className="font-semibold mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`tooltip-${index}`} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <p className="text-sm">
                                {metricNames[entry.dataKey] || entry.name || entry.dataKey}:{' '}
                                <span className="font-medium">
                                    {entry.value} {metricUnits[entry.dataKey] || ''}
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom label for pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
            >
                {`${name} (${value})`}
            </text>
        );
    };

    // Handle metric toggle
    const handleMetricClick = (metric: string) => {
        setActiveMetric(activeMetric === metric ? null : metric);
    };

    // Handle time range change
    const handleTimeRangeChange = (range: 'day' | 'week' | 'month' | 'year') => {
        // This would typically update the timeRange and trigger a new data fetch
        console.log(`Changed time range to: ${range}`);
    };

    if (loading) {
        return (
            <div className={`w-full rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ${className} p-4 flex items-center justify-center h-80`}>
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p>Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`w-full rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ${className} p-4 flex items-center justify-center h-80`}>
                <div className="flex flex-col items-center text-center">
                    <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 font-medium">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ${className}`}>
            {/* Chart Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-1">{title}</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {description}
                </p>

                {/* Time Range Selector */}
                <div className="flex flex-wrap gap-2 mt-3 mb-3">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Time Range:</span>
                    {['day', 'week', 'month', 'year'].map((range) => (
                        <button
                            key={range}
                            onClick={() => handleTimeRangeChange(range as 'day' | 'week' | 'month' | 'year')}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors
                            ${timeRange === range ?
                                    'bg-blue-500 text-white' :
                                    `${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`
                                }`}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Metric Toggles */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {metrics.map((metric) => (
                        <button
                            key={metric}
                            onClick={() => handleMetricClick(metric)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors
                ${activeMetric === metric || activeMetric === null ?
                                    'bg-opacity-100 text-white' :
                                    `${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} bg-opacity-50 hover:bg-opacity-70`}`}
                            style={{
                                backgroundColor: activeMetric === metric || activeMetric === null ?
                                    colorMap[metric] || '#9ca3af' :
                                    ''
                            }}
                        >
                            {metricNames[metric] || metric}
                        </button>
                    ))}
                </div>
            </div>

            {/* Usage Chart */}
            <div className={`p-4 h-80 ${chartData.length === 0 ? 'flex items-center justify-center' : ''}`}>
                {chartData.length === 0 ? (
                    <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No data available for the selected time range
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <defs>
                                {metrics.map((metric) => (
                                    <linearGradient key={`gradient-${metric}`} id={`color-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colorMap[metric]} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colorMap[metric]} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={{ stroke: isDarkMode ? '#4b5563' : '#d1d5db' }}
                                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                formatter={(value) => metricNames[value] || value}
                                wrapperStyle={{ paddingBottom: '10px' }}
                            />

                            {metrics.map((metric) => {
                                // Only render the metric if it's active or no metric is active
                                if (activeMetric === null || activeMetric === metric) {
                                    return (
                                        <React.Fragment key={`fragment-${metric}`}>
                                            <Area
                                                type="monotone"
                                                dataKey={metric}
                                                stroke={colorMap[metric]}
                                                fillOpacity={1}
                                                fill={`url(#color-${metric})`}
                                                strokeWidth={2}
                                                activeDot={{ r: 6 }}
                                                isAnimationActive={true}
                                                animationDuration={1000}
                                                animationEasing="ease-in-out"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey={metric}
                                                stroke={colorMap[metric]}
                                                strokeWidth={2}
                                                dot={{ stroke: colorMap[metric], strokeWidth: 2, r: 4, fill: isDarkMode ? '#1f2937' : 'white' }}
                                                activeDot={{ r: 6 }}
                                                isAnimationActive={true}
                                                animationDuration={1000}
                                                animationEasing="ease-in-out"
                                            />
                                        </React.Fragment>
                                    );
                                }
                                return null;
                            })}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* File Stats Section */}
            {fileStats && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">File Statistics</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
                            <p className="text-2xl font-bold">{fileStats.totalFiles}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
                            <p className="text-2xl font-bold">{(fileStats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average File Size</p>
                            <p className="text-2xl font-bold">{(fileStats.averageSize / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* File Types Chart */}
                        {fileStats.fileTypes && fileStats.fileTypes.length > 0 && (
                            <div className="h-80">
                                <h4 className="text-md font-medium mb-2">File Types</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={fileStats.fileTypes}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="type"
                                        >
                                            {fileStats.fileTypes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Tags Chart */}
                        {fileStats.tags && fileStats.tags.length > 0 && (
                            <div className="h-80">
                                <h4 className="text-md font-medium mb-2">File Tags</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={fileStats.tags.slice(0, 10)} // Show top 10 tags
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tag" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="count" name="Files" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* File Sizes Chart */}
                        {fileStats.fileSizes && fileStats.fileSizes.length > 0 && (
                            <div className="h-80">
                                <h4 className="text-md font-medium mb-2">File Size Distribution</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={fileStats.fileSizes}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="sizeRange" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="count" name="Files" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightsChart;
