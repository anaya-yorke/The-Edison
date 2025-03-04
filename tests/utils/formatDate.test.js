import { formatDate } from '../../utils/dateUtils';

describe('formatDate utility', () => {
  it('formats date correctly', () => {
    // Create a fixed date for testing (2023-06-15)
    const testDate = new Date(2023, 5, 15);
    
    // Test with different format options
    expect(formatDate(testDate, { year: 'numeric', month: 'long', day: 'numeric' }))
      .toBe('June 15, 2023');
    
    expect(formatDate(testDate, { year: 'numeric', month: '2-digit', day: '2-digit' }))
      .toBe('06/15/2023');
  });

  it('handles invalid dates gracefully', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('not a date')).toBe('');
  });
}); 