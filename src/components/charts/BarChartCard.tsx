import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '../../types';

interface BarChartCardProps {
  title: string;
  data: ChartData[];
  dataKey: string;
  xAxisKey?: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({ 
  title, 
  data, 
  dataKey, 
  xAxisKey = 'name' 
}) => {
  return (
    <Card title={title} style={{ height: '100%' }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
          <XAxis dataKey={xAxisKey} stroke="#8c8c8c" />
          <YAxis stroke="#8c8c8c" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f1f1f', 
              border: '1px solid #303030',
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Bar dataKey={dataKey} fill="#006cb8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BarChartCard;
