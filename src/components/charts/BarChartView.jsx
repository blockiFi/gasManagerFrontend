import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer  , Cell, Tooltip, XAxis, YAxis } from 'recharts';

const BarChartView = ({data}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (data, index) => {
    setActiveIndex(index);
  };
  const safeData = Array.isArray(data) ? data : [];
  const activeItem = safeData.length > 0 ? safeData[activeIndex] : null;
  const formatResponse = (dateV , amount) => {
    var date = new Date(dateV);
          
    var formattedDate = format(date, "do MMMM, yyyy");
    var sales_amount  = `₦ ${formatCurrency(amount)}`;

    return `Sales for ${formattedDate} : ${sales_amount} `;

  }
  return (
    <div style={{ width: '100%' }}>
      {safeData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart width={150} height={40} data={safeData}>
              <Tooltip 
                cursor={{ fill: 'rgba(136, 132, 216, 0.2)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { sales_date, total_amount } = payload[0].payload;
                    return (
                      <div style={{ background: '#fff', border: '1px solid #ccc', padding: 10, borderRadius: 4 }}>
                        {formatResponse(sales_date, total_amount)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <XAxis 
                dataKey="sales_date"
                tickFormatter={date => format(new Date(date), 'MMM d')}
                label={{ value: '', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey="total_amount"
                tickFormatter={amt => `₦${formatCurrency(amt)}`}
                label={{ value: 'Amount', angle: 0, position: 'top'  }}
                tickMargin={10}
                tick={{ fontSize: 11 }}
              />
              <Bar dataKey="total_amount" onClick={handleClick}>
                {safeData.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={index === activeIndex ? '#82ca9d' : '#8884d8'}
                    key={`cell-${index}`}
                  />
                ))}
              </Bar>
              
            </BarChart>
          </ResponsiveContainer>
         
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

export default BarChartView