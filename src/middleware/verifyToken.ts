import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken' 


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const token = (req as any).cookies?.token

	if (!token) return res.status(401).json({ message: 'No token provided' })

	const secret = process.env.JWT_SECRET || 'secretkey'
	try {
		const decoded = jwt.verify(token, secret)
		next()
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' })
	}
}
