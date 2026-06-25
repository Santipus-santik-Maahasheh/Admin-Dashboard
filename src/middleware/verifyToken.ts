import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken' 

export type Role = 'SuperAdmin' | 'Admin' | 'Employee'

interface JwtPayload {
  id: string
  role: Role
  employeeId?: string
  // Tenant the user belongs to; undefined for SuperAdmin.
  organization?: string
}

// Extend Express Request to carry the decoded user
export interface AuthRequest extends Request {
  user?: JwtPayload
}


export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
	const token = (req as any).cookies?.token

	if (!token) return res.status(401).json({ message: 'No token provided' })

	const secret = process.env.JWT_SECRET || 'secretkey'
	try {
		const decoded = jwt.verify(token, secret) as JwtPayload
		req.user = decoded
		next()
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' })
	}
}
