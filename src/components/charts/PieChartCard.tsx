import React from 'react';
import { Card } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '../../types';

interface PieChartCardProps {
  title: string;
  data: ChartData[];
  dataKey?: string;
  nameKey?: string;
}

// Pertamina color palette for pie chart
const COLORS = ['#006cb8', '#acc42a', '#ed1b2f', '#005090', '#8fa622', '#c4d965'];

const PieChartCard: React.FC<PieChartCardProps> = ({ 
  title, 
  data, 
  dataKey = 'value'
}) => {
  return (
    <Card title={title} style={{ height: '100%' }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f1f1f', 
              border: '1px solid #303030',
              borderRadius: '4px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PieChartCard;
