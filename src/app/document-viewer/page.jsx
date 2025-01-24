'use client'
import React from 'react'
import DocumentViewer from '../../pages/DocumentViewer'
import withAuth from '../utils/auth'

const page = () => {
  return (
    <>
    <DocumentViewer/>
    </>
  )
}

export default withAuth(page)