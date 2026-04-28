import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip } from 'recharts';
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div className="custom-tooltip " style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc '  }}>
          <p className='text-green-400'>{name}</p>
          <p>{`Total Sales: ₦${formatCurrency(value)}`}</p>
        </div>
      );
    }
    return null;
  };
const peiChart = ({data , keyValue}) => {
    const [activeIndex, setActiveIndex] = useState(-1);

   

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    }
    return (
        <PieChart width={200} height={200}>
        <Pie
            activeIndex={activeIndex}
            data={data}
            dataKey={keyValue}
            outerRadius={90}
            fill="green"
            onMouseEnter={onPieEnter}
            style={{ cursor: 'pointer', outline: 'none' }} // Ensure no outline on focus
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Tooltip content={<CustomTooltip />}  />
        
    </PieChart>

      );
}

export default peiChart