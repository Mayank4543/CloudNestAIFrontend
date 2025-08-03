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
interface FileTypeDistribution {
    type: string;
    count: number;
    color: string;
}

interface DashboardInsightsChartProps {
    isDarkMode?: boolean;
    title?: string;
    description?: string;
}

const DashboardInsightsChart: React.FC<DashboardInsightsChartProps> = ({
    isDarkMode = false,
    title = "File Insights",
    description = "Analytics and statistics for your stored files"
}) => {
    const [activityData, setActivityData] = useState<DataPoint[]>([]);
    const [fileTypeData, setFileTypeData] = useState<FileTypeDistribution[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChart, setSelectedChart] = useState<'activity' | 'storage' | 'filetypes'>('activity');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    // Colors for charts
    const chartColors = {
        uploads: isDarkMode ? '#4ade80' : '#10b981',
        downloads: isDarkMode ? '#60a5fa' : '#3b82f6',
        storage: isDarkMode ? '#f472b6' : '#ec4899',
        accent: isDarkMode ? '#c084fc' : '#8b5cf6',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        text: isDarkMode ? '#e5e7eb' : '#1f2937',
        grid: isDarkMode ? '#374151' : '#e5e7eb',
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // For a real app, we'd fetch this data from the backend
                // For now, generate mock data for demonstration
                generateMockData();
            } catch (err: any) {
                setError(err.message || 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    // Mock data generation for demo purposes
    const generateMockData = () => {
        // Generate activity data (uploads, downloads over time)
        const mockActivityData: DataPoint[] = [];
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        
        let date = new Date();
        date.setDate(date.getDate() - days);
        
        for (let i = 0; i <= days; i++) {
            const currentDate = new Date(date);
            currentDate.setDate(currentDate.getDate() + i);
            
            const dateStr = currentDate.toISOString().split('T')[0];
            const uploads = Math.floor(Math.random() * 10) + 1;
            const downloads = Math.floor(Math.random() * 15) + 1;
            const storageUsed = Math.floor(Math.random() * 100) + 50; // MB
            
            mockActivityData.push({
                date: dateStr,
                uploads,
                downloads,
                storageUsed
            });
        }
        
        setActivityData(mockActivityData);
        
        // Generate file type distribution
        const fileTypes = [
            { type: 'Images', count: Math.floor(Math.random() * 100) + 20, color: COLORS[0] },
            { type: 'Documents', count: Math.floor(Math.random() * 100) + 30, color: COLORS[1] },
            { type: 'Videos', count: Math.floor(Math.random() * 50) + 10, color: COLORS[2] },
            { type: 'Audio', count: Math.floor(Math.random() * 30) + 5, color: COLORS[3] },
            { type: 'Archives', count: Math.floor(Math.random() * 40) + 15, color: COLORS[4] },
            { type: 'Others', count: Math.floor(Math.random() * 20) + 5, color: COLORS[5] },
        ];
        
        setFileTypeData(fileTypes);
    };

    // Calculate total files
    const totalFiles = fileTypeData.reduce((sum, item) => sum + item.count, 0);

    // Custom tooltip formatter for recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded shadow-sm`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {label}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Format date for X-axis
    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Render loading state
    if (loading) {
        return (
            <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'}`}>
                <p className="text-sm">Error loading insights: {error}</p>
            </div>
        );
    }

    return (
        <div className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-lg transition-colors duration-200`}>
            <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
                    </div>

                    <div className="flex mt-4 sm:mt-0 space-x-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className={`text-sm rounded-md border ${isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-700'
                            } py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#18b26f] focus:border-transparent`}
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                    </div>
                </div>

                {/* Chart Type Selector */}
                <div className="flex border-b mb-6 overflow-x-auto scrollbar-hide">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${selectedChart === 'activity' 
                            ? `border-b-2 border-[#18b26f] ${isDarkMode ? 'text-[#4ade80]' : 'text-[#18b26f]'}`
                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                        onClick={() => setSelectedChart('activity')}
                    >
                        Activity
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${selectedChart === 'storage' 
                            ? `border-b-2 border-[#18b26f] ${isDarkMode ? 'text-[#4ade80]' : 'text-[#18b26f]'}`
                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                        onClick={() => setSelectedChart('storage')}
                    >
                        Storage
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${selectedChart === 'filetypes' 
                            ? `border-b-2 border-[#18b26f] ${isDarkMode ? 'text-[#4ade80]' : 'text-[#18b26f]'}`
                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                        }`}
                        onClick={() => setSelectedChart('filetypes')}
                    >
                        File Types
                    </button>
                </div>

                {/* Activity Chart */}
                {selectedChart === 'activity' && (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={activityData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 30,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke={chartColors.text}
                                    tickFormatter={formatXAxis}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis stroke={chartColors.text} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} />
                                <Line
                                    type="monotone"
                                    dataKey="uploads"
                                    name="Uploads"
                                    stroke={chartColors.uploads}
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="downloads"
                                    name="Downloads"
                                    stroke={chartColors.downloads}
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Storage Chart */}
                {selectedChart === 'storage' && (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={activityData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 30,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke={chartColors.text}
                                    tickFormatter={formatXAxis}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    stroke={chartColors.text} 
                                    tick={{ fontSize: 12 }} 
                                    label={{ 
                                        value: 'Storage Used (MB)', 
                                        angle: -90, 
                                        position: 'insideLeft',
                                        style: { fill: chartColors.text, fontSize: '12px' }
                                    }} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} />
                                <Area
                                    type="monotone"
                                    dataKey="storageUsed"
                                    name="Storage Used (MB)"
                                    fill={isDarkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)'}
                                    stroke={chartColors.accent}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="uploads"
                                    name="Uploads"
                                    stroke={chartColors.uploads}
                                    dot={false}
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* File Types Chart */}
                {selectedChart === 'filetypes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fileTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="type"
                                        // label={({ name, percent }) => `${name} ${(`${percent}` * 100).toFixed(0)}%`}
                                    >
                                        {fileTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} files`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={fileTypeData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 30,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                                    <XAxis dataKey="type" stroke={chartColors.text} />
                                    <YAxis stroke={chartColors.text} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="Files" fill={chartColors.accent} radius={[4, 4, 0, 0]}>
                                        {fileTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Stats */}
                        <div className={`col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Files</p>
                                <p className="text-2xl font-semibold mt-1">{totalFiles}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Largest Category</p>
                                <p className="text-2xl font-semibold mt-1">
                                    {fileTypeData.reduce((prev, current) => (prev.count > current.count) ? prev : current).type}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Uploads Today</p>
                                <p className="text-2xl font-semibold mt-1">{activityData[activityData.length - 1]?.uploads || 0}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Storage Used</p>
                                <p className="text-2xl font-semibold mt-1">{activityData[activityData.length - 1]?.storageUsed || 0} MB</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardInsightsChart;
