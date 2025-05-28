import React from 'react'
import PageTitle from '../../components/Typography/PageTitle'
import { Card, CardBody, Button } from '@windmill/react-ui'

function PromotionApp() {
  return (
    <>
      <PageTitle>System Promotions Management</PageTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <Button>Create New Promotion</Button>
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">No promotions found</p>
        </div>
      </div>
    </>
  )
}

export default PromotionApp