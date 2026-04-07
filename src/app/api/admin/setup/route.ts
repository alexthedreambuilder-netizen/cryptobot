import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Admin credentials
const ADMIN_USERNAME = 'bamboleo1121'
const ADMIN_PASSWORD = 'bamboleo1212'

// GET - Check if admin exists
export async function GET() {
  try {
    const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } })
    
    if (existingAdmin) {
      return NextResponse.json({ 
        configured: true, 
        message: 'Admin already configured' 
      })
    }

    return NextResponse.json({ 
      configured: false, 
      message: 'Admin can be configured' 
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create predefined admin
export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({ where: { isAdmin: true } })
    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Admin already configured',
        configured: true 
      }, { status: 403 })
    }

    // Hash password
    const hashedPassword = await hashPassword(ADMIN_PASSWORD)

    // Create admin
    const admin = await prisma.user.create({
      data: {
        username: ADMIN_USERNAME,
        password: hashedPassword,
        isAdmin: true,
        level: 4,
        points: 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        uniqueId: admin.uniqueId,
      },
    })
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
