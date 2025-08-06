import * as authService from '../services/authService.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await authService.loginUser(email, password);

  // Define o access token em um cookie (vida curta)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutos
  });

  // Define o refresh token em outro cookie (vida longa)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });

  res.status(200).json({ message: 'Login successful!' });
};

export const refresh = (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found.' });
  }

  const newAccessToken = authService.refreshAccessToken(refreshToken);

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    // ... (mesmas opções do cookie de acesso)
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({ message: 'Token refreshed successfully.' });
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout successful!' });
};