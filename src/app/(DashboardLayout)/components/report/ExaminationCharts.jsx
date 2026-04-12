"use client";
import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6666", "#4CE8C5"];

const ExaminationCharts = ({ data }) => {
  // Process data for department chart
  const departmentData = data.reduce((acc, item) => {
    const dept = acc.find(d => d.name === item.department);
    if (dept) {
      dept.value += 1;
    } else {
      acc.push({ name: item.department, value: 1 });
    }
    return acc;
  }, []);

  // Process data for examination type chart
  const typeData = data.reduce((acc, item) => {
    const type = acc.find(t => t.name === item.examinationType);
    if (type) {
      type.value += 1;
    } else {
      acc.push({ name: item.examinationType, value: 1 });
    }
    return acc;
  }, []);

  // Process data for status chart
  const statusData = data.reduce((acc, item) => {
    const status = acc.find(s => s.name === item.status);
    if (status) {
      status.value += 1;
    } else {
      acc.push({ name: item.status, value: 1 });
    }
    return acc;
  }, []);

  // Process data for daily examinations chart (last 7 days)
  const generateDailyData = () => {
    const dailyMap = {};
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }
    
    // Count examinations by date
    data.forEach(item => {
      if (!item.date) {
        return;
      }

      const normalizedDate = new Date(item.date);
      if (Number.isNaN(normalizedDate.getTime())) {
        return;
      }

      const dateKey = normalizedDate.toISOString().split('T')[0];
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey] += 1;
      }
    });
    
    // Convert to array for chart
    return Object.keys(dailyMap).map(date => ({
      date: date,
      count: dailyMap[date]
    }));
  };

  const dailyData = generateDailyData();

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'white' }}>
          <Typography variant="body2">{`${payload[0].name}: ${payload[0].value}`}</Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={3}>
        {/* Tасгуудын үзлэг */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Тасгуудын үзлэг" 
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Үзлэгийн төрлүүд */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Үзлэгийн төрлүүд" 
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 7 хоногийн үзлэгийн тоо */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardHeader 
              title="7 хоногийн үзлэгийн тоо" 
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Үзлэгийн тоо" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Үзлэгийн төлвүүд */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardHeader 
              title="Үзлэгийн төлвүүд" 
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ pb: 0 }}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === "Дууссан" ? "#00C49F" : "#FFBB28"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExaminationCharts;
