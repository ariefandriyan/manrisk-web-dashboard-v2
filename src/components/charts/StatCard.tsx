import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  precision?: number;
  trend?: 'up' | 'down';
  trendValue?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  prefix, 
  suffix,
  precision = 0,
  trend,
  trendValue 
}) => {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
      />
      {trend && trendValue !== undefined && (
        <div style={{ marginTop: 8 }}>
          <span style={{ 
            color: trend === 'up' ? '#3f8600' : '#cf1322',
            fontSize: '14px'
          }}>
            {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {' '}{trendValue}%
          </span>
          <span style={{ marginLeft: 8, color: '#8c8c8c' }}>vs last period</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
