import dayjsTZ, { buildDateRangeFilter, extendedDayjs } from '@/utils/dayjs.utils';

describe('dayjs.utils', () => {
  describe('dayjsTZ', () => {
    it('should return a dayjs object with timezone', () => {
      const date = dayjsTZ();
      expect(date).toBeDefined();
      expect(date.isValid()).toBe(true);
    });

    it('should handle date input', () => {
      const input = '2023-01-01';
      const date = dayjsTZ(input);
      expect(date.format('YYYY-MM-DD')).toBe(input);
    });
  });

  describe('extendedDayjs', () => {
    it('should have plugins extended', () => {
      expect(extendedDayjs.duration).toBeDefined();
      expect(extendedDayjs.utc).toBeDefined();
    });
  });

  describe('buildDateRangeFilter', () => {
    it('should return undefined if no date range provided', () => {
      expect(buildDateRangeFilter()).toBeUndefined();
      expect(buildDateRangeFilter({})).toBeUndefined();
      expect(buildDateRangeFilter({ startDate: undefined, endDate: undefined })).toBeUndefined();
    });

    it('should return gte filter for startDate', () => {
      const startDate = new Date('2023-01-01');
      const filter = buildDateRangeFilter({ startDate });
      expect(filter).toBeDefined();
      expect(filter?.gte).toEqual(extendedDayjs(startDate).startOf('day').toDate());
      expect(filter?.lte).toBeUndefined();
    });

    it('should return lte filter for endDate', () => {
      const endDate = new Date('2023-01-31');
      const filter = buildDateRangeFilter({ endDate });
      expect(filter).toBeDefined();
      expect(filter?.lte).toEqual(extendedDayjs(endDate).endOf('day').toDate());
      expect(filter?.gte).toBeUndefined();
    });

    it('should return both gte and lte filters', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const filter = buildDateRangeFilter({ startDate, endDate });
      expect(filter).toBeDefined();
      expect(filter?.gte).toEqual(extendedDayjs(startDate).startOf('day').toDate());
      expect(filter?.lte).toEqual(extendedDayjs(endDate).endOf('day').toDate());
    });
  });
});
