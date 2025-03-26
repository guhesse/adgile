
import React from "react";
import { LayoutTemplate } from "@/components/editor/types/admin";
import { AdminStats } from "@/components/editor/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  PieChart, 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Pie, 
  Cell 
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminLayoutStatsProps {
  stats: AdminStats;
  layouts: LayoutTemplate[];
}

export const AdminLayoutStats: React.FC<AdminLayoutStatsProps> = ({ stats, layouts }) => {
  // Prepare data for orientation distribution chart
  const orientationData = [
    { name: "Horizontal", value: stats.horizontalTemplates },
    { name: "Vertical", value: stats.verticalTemplates },
    { name: "Square", value: stats.squareTemplates },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  // Prepare data for creation timeline chart
  const getTimelineData = () => {
    if (layouts.length === 0) return [];
    
    // Group layouts by month
    const groupedByMonth: Record<string, number> = {};
    
    layouts.forEach(layout => {
      const date = new Date(layout.createdAt);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = 0;
      }
      
      groupedByMonth[month]++;
    });
    
    // Convert to array and sort by month
    return Object.entries(groupedByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const timelineData = getTimelineData();

  // Prepare data for size distribution
  const getSizeDistribution = () => {
    if (layouts.length === 0) return [];
    
    // Define size categories
    const categories = [
      { name: "Small", minArea: 0, maxArea: 250000 },         // up to 500x500
      { name: "Medium", minArea: 250000, maxArea: 640000 },   // up to 800x800
      { name: "Large", minArea: 640000, maxArea: 1440000 },   // up to 1200x1200
      { name: "X-Large", minArea: 1440000, maxArea: Infinity } // larger than 1200x1200
    ];
    
    const distribution = categories.map(cat => ({ name: cat.name, count: 0 }));
    
    layouts.forEach(layout => {
      const area = layout.width * layout.height;
      
      for (let i = 0; i < categories.length; i++) {
        if (area >= categories[i].minArea && area < categories[i].maxArea) {
          distribution[i].count++;
          break;
        }
      }
    });
    
    return distribution;
  };

  const sizeDistribution = getSizeDistribution();

  return (
    <ScrollArea className="h-full">
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Layout Orientation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orientationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orientationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sizeDistribution}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Layouts" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {timelineData.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Layout Creation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Layouts Created" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
