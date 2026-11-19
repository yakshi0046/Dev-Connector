export const monthYear = (d) => (d ? new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'short' }) : '');
export const dayMonthYear = (d) => new Date(d).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
export const period = (e) => `${monthYear(e.from)} to ${e.current ? 'now' : monthYear(e.to) || 'n/a'}`;
