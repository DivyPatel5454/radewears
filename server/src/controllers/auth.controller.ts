import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendWelcomeEmail } from '../utils/emailService';

const JWT_SECRET = (process.env.JWT_SECRET as jwt.Secret) || 'dev-secret-token';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set in env. Using development fallback; set JWT_SECRET for production.');
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('Warning: GOOGLE_CLIENT_ID is not set in env. Google login will not work until configured.');
}

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ status: 'error', message: 'Google idToken is required' });
    }

    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(verifyUrl);
    if (!response.ok) {
      return res.status(401).json({ status: 'error', message: 'Google token invalid' });
    }

    interface GoogleTokenPayload {
      aud: string;
      sub: string;
      email: string;
      name: string;
      picture?: string;
    }

    const payload = (await response.json()) as GoogleTokenPayload;
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return res.status(403).json({ status: 'error', message: 'Google client ID mismatch' });
    }

    const { sub, email, name, picture } = payload;
    if (!sub || !email || !name) {
      return res.status(400).json({ status: 'error', message: 'Google profile missing required fields' });
    }

    let user = await User.findOne({ googleId: sub });
    let isNewUser = false;

    if (!user) {
      user = new User({
        googleId: sub,
        email,
        name,
        avatar: picture,
      });
      await user.save();
      isNewUser = true;
    } else {
      user.email = email;
      user.name = name;
      user.avatar = picture;
      await user.save();
    }

    if (isNewUser) {
      // Intentionally not awaiting here to avoid blocking response
      sendWelcomeEmail(user.email, user.name).catch((err) => 
        console.error('Failed to send welcome email:', err)
      );
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    return res.status(200).json({ status: 'success', data: { user, token } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return res.status(500).json({ status: 'error', message });
  }
};
