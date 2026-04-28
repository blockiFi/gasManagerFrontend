import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const  formatCurrency = (value) => {
  return new Intl.NumberFormat('ja-JP' ).format(
    value,
  )
} 
export function projectedValues(data, weeksToUse = 12) {
  if (!data || data.length < 2) return null;

  const recentData = data.slice(-weeksToUse);

  const fields = Object.keys(recentData[0]).filter(
    key => key !== "group" && typeof recentData[0][key] === "number"
  );

  const xValues = recentData.map(d => new Date(d.group).getTime());

  const results = {};

  fields.forEach(field => {
    const yValues = recentData.map(d => d[field]);

    const n = yValues.length;
    const sumX = xValues.reduce((acc, x) => acc + x, 0);
    const sumY = yValues.reduce((acc, y) => acc + y, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      results[field] = null; // avoid division by zero
      return;
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const lastDate = new Date(xValues[xValues.length - 1]);
    const nextWeekDate = new Date(lastDate);
    nextWeekDate.setDate(lastDate.getDate() + 7);
    const xFuture = nextWeekDate.getTime();

    const projectedY = slope * xFuture + intercept;
    results[field] = parseFloat(projectedY.toFixed(2));
  });

  const lastDate = new Date(xValues[xValues.length - 1]);
  const nextWeekDate = new Date(lastDate);
  nextWeekDate.setDate(lastDate.getDate() + 7);

  return {
    date: (() => {
      // Check if the last group is a quarter string like "Q2 2025"
      const lastGroup = data[data.length - 1]?.group;
      if (typeof lastGroup === "string" && /^Q[1-4]\s\d{4}$/.test(lastGroup)) {
        // Calculate next quarter
        const [_, quarter, year] = lastGroup.match(/^Q([1-4])\s(\d{4})$/) || [];
        if (quarter && year) {
          let nextQuarter = parseInt(quarter, 10) + 1;
          let nextYear = parseInt(year, 10);
          if (nextQuarter > 4) {
            nextQuarter = 1;
            nextYear += 1;
          }
          return `Q${nextQuarter} ${nextYear}`;
        }
      }
      // Otherwise, use the nextWeekDate as ISO string
      return nextWeekDate.toISOString().slice(0, 10);
    })(),
    projections: results,
  };
}
