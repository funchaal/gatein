import { getCompanyInitials, isSvgUrl } from '../CompanyLogo';

describe('CompanyLogo Helper Functions', () => {
  describe('getCompanyInitials', () => {
    it('returns initials for two or more words', () => {
      expect(getCompanyInitials('Terminal Santos')).toBe('TS');
      expect(getCompanyInitials('Santos Brasil Logistica')).toBe('SB');
      expect(getCompanyInitials('DP World Santos')).toBe('DW');
    });

    it('returns first two letters for single long words', () => {
      expect(getCompanyInitials('BTP')).toBe('BT');
      expect(getCompanyInitials('Ecoporto')).toBe('EC');
    });

    it('returns full word if length <= 2', () => {
      expect(getCompanyInitials('TM')).toBe('TM');
      expect(getCompanyInitials('A')).toBe('A');
    });

    it('returns fallback "?" for empty or invalid names', () => {
      expect(getCompanyInitials('')).toBe('?');
      expect(getCompanyInitials(null)).toBe('?');
      expect(getCompanyInitials(undefined)).toBe('?');
    });
  });

  describe('isSvgUrl', () => {
    it('identifies .svg extensions accurately', () => {
      expect(isSvgUrl('https://example.com/logo.svg')).toBe(true);
      expect(isSvgUrl('https://example.com/logo.SVG')).toBe(true);
      expect(isSvgUrl('https://example.com/path/logo.svg?v=123#anchor')).toBe(true);
    });

    it('identifies svg base64 data URIs', () => {
      expect(isSvgUrl('data:image/svg+xml;base64,PHN2Zy...')).toBe(true);
    });

    it('returns false for non-svg URLs', () => {
      expect(isSvgUrl('https://example.com/logo.png')).toBe(false);
      expect(isSvgUrl('https://example.com/logo.jpg')).toBe(false);
      expect(isSvgUrl('data:image/png;base64,iVBORw...')).toBe(false);
      expect(isSvgUrl('')).toBe(false);
      expect(isSvgUrl(null)).toBe(false);
    });
  });
});
