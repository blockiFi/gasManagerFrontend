"use client"
import React, { PureComponent } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

const  ChartView = ({data}) => {
  return (
    <div style={{ width: '100%' }}>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          width={500}
          height={200}
          data={data}
          syncId="anyId"
          margin={{
            top: 10,
            right: 30,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sales_date" />
          <YAxis  domain={[0, 'dataMax + 200000']}  />
          <Tooltip />
          <Line type="monotone" dataKey="total_amount" stroke="#8884d8" fill="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default  ChartView ;