import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '../../types';

interface LineChartCardProps {
  title: string;
  data: ChartData[];
  dataKey: string;
  xAxisKey?: string;
}

const LineChartCard: React.FC<LineChartCardProps> = ({ 
  title, 
  data, 
  dataKey, 
  xAxisKey = 'name' 
}) => {
  return (
    <Card title={title} style={{ height: '100%' }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
          <Line type="monotone" dataKey={dataKey} stroke="#006cb8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LineChartCard;
