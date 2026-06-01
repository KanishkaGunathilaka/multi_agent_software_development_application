import { hashPassword, comparePassword, isStrongPassword } from '../../utils/passwordUtils';

describe('Password Utils', () => {
  it('should validate strong passwords correctly', () => {
    expect(isStrongPassword('Password1')).toBe(true); // meets all rules
    expect(isStrongPassword('Pass1')).toBe(false); // too short
    expect(isStrongPassword('password')).toBe(false); // no number
    expect(isStrongPassword('12345678')).toBe(false); // no letter
  });

  it('should hash and compare passwords correctly', async () => {
    const plain = 'StrongPass123';
    const hash = await hashPassword(plain);
    expect(typeof hash).toBe('string');
    expect(await comparePassword(plain, hash)).toBe(true);
    expect(await comparePassword('WrongPass', hash)).toBe(false);
  });
});
